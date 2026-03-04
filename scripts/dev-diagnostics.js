#!/usr/bin/env node
/**
 * Unified Dev Diagnostics Tool
 * Single command that audits: lock files, running processes, ports,
 * .next-dev cache size, health endpoints, and suggests auto-fixes.
 *
 * Usage:
 *   npm run diagnose              # Full report + fixes
 *   npm run diagnose --json       # JSON output for automation
 *   npm run diagnose --fix        # Auto-apply recommended fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

// Config
const LOCK_PATH = path.join(process.cwd(), '.next-dev', 'dev', 'lock');
const CACHE_DIR = path.join(process.cwd(), '.next-dev');
const PORTS_TO_CHECK = [3000, 3001, 3002, 3003, 3004, 3005];
const HEALTH_TIMEOUT = 2500;

// Parse args
const args = process.argv.slice(2);
const isJSON = args.includes('--json');
const shouldFix = args.includes('--fix');

/**
 * Build diagnostics object
 */
async function runDiagnostics() {
  const report = {
    timestamp: new Date().toISOString(),
    sections: {
      lockFile: await checkLockFile(),
      processes: await checkProcesses(),
      ports: await checkPorts(),
      cache: await checkCacheSize(),
      health: await checkHealth(),
    },
    issues: [],
    recommendations: [],
  };

  // Cross-check and infer issues
  inferIssues(report);

  return report;
}

/**
 * Check lock file status
 */
async function checkLockFile() {
  const lockExists = fs.existsSync(LOCK_PATH);
  let lockAge = null;
  let lockStale = false;

  if (lockExists) {
    try {
      const stat = fs.statSync(LOCK_PATH);
      lockAge = Math.floor((Date.now() - stat.mtimeMs) / 1000); // seconds
      lockStale = lockAge > 300; // stale if > 5 mins
    } catch (e) {
      // stat failed
    }
  }

  return {
    exists: lockExists,
    path: LOCK_PATH,
    ageSeconds: lockAge,
    stale: lockStale,
  };
}

/**
 * Check running next dev processes via PowerShell
 */
async function checkProcesses() {
  const processes = [];
  try {
    const psCmd = `Get-CimInstance Win32_Process -Filter "name='node.exe'" | Where-Object {$_.CommandLine -match 'next|dev'} | Select-Object ProcessId, CommandLine | ConvertTo-Json`;
    const result = execSync(`powershell -NoProfile -Command "${psCmd}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (result.trim()) {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        processes.push(...parsed.map(p => ({ pid: p.ProcessId, cmd: p.CommandLine })));
      } else if (parsed.ProcessId) {
        processes.push({ pid: parsed.ProcessId, cmd: parsed.CommandLine });
      }
    }
  } catch (e) {
    // No processes or PS error; return empty
  }

  return {
    count: processes.count,
    list: processes,
  };
}

/**
 * Check which ports are open
 */
async function checkPorts() {
  const results = [];

  for (const port of PORTS_TO_CHECK) {
    const open = await isPortOpen(port);
    results.push({ port, open });
  }

  return {
    checked: PORTS_TO_CHECK,
    results,
  };
}

/**
 * Check .next-dev directory size
 */
async function checkCacheSize() {
  let sizeBytes = 0;
  let exists = fs.existsSync(CACHE_DIR);

  if (exists) {
    try {
      // Windows: use dir /s /b for size calculation (rough estimate)
      const sizeStr = execSync(`powershell -NoProfile -Command "Get-ChildItem -Path "${CACHE_DIR}" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`, {
        encoding: 'utf-8',
      }).trim();
      sizeBytes = parseInt(sizeStr) || 0;
    } catch (e) {
      // dir failed; try file count
      try {
        const count = execSync(`powershell -NoProfile -Command "(Get-ChildItem -Path "${CACHE_DIR}" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count"`, {
          encoding: 'utf-8',
        }).trim();
        sizeBytes = parseInt(count) * 1000; // rough estimate
      } catch (e2) {
        // ignore
      }
    }
  }

  return {
    path: CACHE_DIR,
    exists,
    sizeBytes,
    sizeMB: (sizeBytes / 1024 / 1024).toFixed(2),
  };
}

/**
 * Check health endpoints on all ports
 */
async function checkHealth() {
  const results = [];

  for (const port of PORTS_TO_CHECK) {
    const healthUrl = `http://localhost:${port}/health`;
    const health = await probeHealth(healthUrl);
    results.push({ port, healthUrl, ...health });
  }

  return {
    results,
    healthyPorts: results.filter(r => r.ok).map(r => r.port),
  };
}

/**
 * Probe single health endpoint
 */
function probeHealth(url) {
  return new Promise(resolve => {
    const startTime = Date.now();
    const req = http.get(url, { timeout: HEALTH_TIMEOUT }, res => {
      const elapsed = Date.now() - startTime;
      resolve({
        ok: res.statusCode === 200,
        status: res.statusCode,
        elapsed,
      });
    });

    req.on('timeout', () => {
      req.abort();
      resolve({ ok: false, status: 'timeout', elapsed: HEALTH_TIMEOUT });
    });

    req.on('error', err => {
      const elapsed = Date.now() - startTime;
      resolve({ ok: false, status: err.code || 'error', elapsed });
    });

    setTimeout(() => req.abort(), HEALTH_TIMEOUT);
  });
}

/**
 * Check if port is available
 */
function isPortOpen(port) {
  return new Promise(resolve => {
    const server = require('net').createServer();
    server.once('error', err => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Infer issues and recommendations
 */
function inferIssues(report) {
  const { lockFile, processes, ports, cache, health } = report.sections;

  // Issue: stale lock file
  if (lockFile.stale) {
    report.issues.push({
      severity: 'high',
      code: 'STALE_LOCK',
      message: `Stale lock file detected (${lockFile.ageSeconds}s old). May block dev server start.`,
    });
    report.recommendations.push({
      action: 'npm run dev:unlock',
      description: 'Remove lock file only',
      severity: 'high',
    });
  }

  // Issue: lock file + no healthy processes
  if (lockFile.exists && health.healthyPorts.length === 0) {
    report.issues.push({
      severity: 'high',
      code: 'LOCK_WITHOUT_HEALTH',
      message: 'Lock file exists but no healthy dev server found. Likely stuck.',
    });
    report.recommendations.push({
      action: 'npm run dev:restart',
      description: 'Force-restart recovery launcher (cleans lock + kills stuck processes)',
      severity: 'high',
    });
  }

  // Issue: large cache
  if (report.sections.cache.sizeBytes > 500 * 1024 * 1024) {
    report.issues.push({
      severity: 'medium',
      code: 'LARGE_CACHE',
      message: `Cache directory too large (${report.sections.cache.sizeMB}MB). May slow builds.`,
    });
    report.recommendations.push({
      action: 'rm -r .next-dev; npm run dev',
      description: 'Clear cache and restart dev server',
      severity: 'medium',
    });
  }

  // Issue: multiple healthy ports (race condition)
  if (health.healthyPorts.length > 1) {
    report.issues.push({
      severity: 'medium',
      code: 'MULTIPLE_SERVERS',
      message: `Multiple dev servers running on ports: ${health.healthyPorts.join(', ')}. May cause conflicts.`,
    });
    report.recommendations.push({
      action: 'npm run dev:stop; npm run dev',
      description: 'Stop all dev servers and restart fresh',
      severity: 'medium',
    });
  }

  // Issue: stuck processes on occupied port
  if (processes.list.length > 0 && health.healthyPorts.length === 0 && ports.results.every(r => !r.open)) {
    report.issues.push({
      severity: 'high',
      code: 'STUCK_PROCESS',
      message: `${processes.list.length} process(es) running but no healthy endpoint found. Processes may be stuck.`,
    });
    report.recommendations.push({
      action: 'npm run dev:stop; npm run dev',
      description: 'Terminate stuck processes and restart clean',
      severity: 'high',
    });
  }

  // If no issues, all is well
  if (report.issues.length === 0) {
    if (health.healthyPorts.length > 0) {
      report.recommendations.push({
        action: 'none',
        description: `All systems healthy. Dev server running on port ${health.healthyPorts[0]}. Happy coding!`,
        severity: 'info',
      });
    } else {
      report.recommendations.push({
        action: 'npm run dev',
        description: 'All systems ready. Start dev server when needed.',
        severity: 'info',
      });
    }
  }
}

/**
 * Pretty-print report
 */
function printReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('DEV DIAGNOSTICS REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}\n`);

  // Lock file section
  console.log('📁 LOCK FILE');
  console.log(`   Exists: ${report.sections.lockFile.exists}`);
  if (report.sections.lockFile.exists) {
    console.log(`   Age: ${report.sections.lockFile.ageSeconds}s`);
    console.log(`   Stale: ${report.sections.lockFile.stale ? '⚠️  YES' : 'No'}`);
  }
  console.log();

  // Processes section
  console.log('⚙️  PROCESSES');
  console.log(`   Count: ${report.sections.processes.list.length}`);
  if (report.sections.processes.list.length > 0) {
    report.sections.processes.list.forEach(p => {
      console.log(`   - PID ${p.pid}: ${p.cmd.substring(0, 60)}`);
    });
  }
  console.log();

  // Ports section
  console.log('🔌 PORTS');
  report.sections.ports.results.forEach(p => {
    const symbol = p.open ? '✓' : '✕';
    console.log(`   ${symbol} Port ${p.port}: ${p.open ? 'Available' : 'In use'}`);
  });
  console.log();

  // Cache section
  console.log('💾 CACHE');
  console.log(`   Path: ${report.sections.cache.path}`);
  console.log(`   Exists: ${report.sections.cache.exists}`);
  if (report.sections.cache.exists) {
    console.log(`   Size: ${report.sections.cache.sizeMB}MB`);
  }
  console.log();

  // Health section
  console.log('❤️  HEALTH CHECK');
  console.log(`   Healthy ports: ${report.sections.health.healthyPorts.length > 0 ? report.sections.health.healthyPorts.join(', ') : 'None'}`);
  if (report.sections.health.healthyPorts.length === 1) {
    const port = report.sections.health.healthyPorts[0];
    console.log(`   ✓ Dev server ready at http://localhost:${port}`);
  }
  console.log();

  // Issues section
  if (report.issues.length > 0) {
    console.log('⚠️  ISSUES DETECTED');
    report.issues.forEach((issue, i) => {
      const severityIcon =
        issue.severity === 'high' ? '🔴' :
        issue.severity === 'medium' ? '🟡' : '🔵';
      console.log(`   ${severityIcon} [${issue.code}] ${issue.message}`);
    });
    console.log();
  }

  // Recommendations section
  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    report.recommendations.forEach((rec, i) => {
      const icon =
        rec.severity === 'high' ? '🔴' :
        rec.severity === 'medium' ? '🟡' :
        rec.severity === 'info' ? '✨' : '→';
      console.log(`   ${icon} ${rec.action}`);
      console.log(`      ${rec.description}`);
    });
    console.log();
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * Auto-apply fixes
 */
async function applyFixes(report) {
  const highSeverity = report.recommendations.filter(r => r.severity === 'high');
  if (highSeverity.length === 0) {
    console.log('✓ No critical issues to fix.\n');
    return;
  }

  console.log(`Auto-fixing ${highSeverity.length} critical issue(s)...\n`);

  for (const rec of highSeverity) {
    if (rec.action === 'npm run dev:unlock') {
      console.log('→ Removing stale lock file...');
      try {
        fs.rmSync(LOCK_PATH, { force: true });
        console.log('✓ Lock file removed\n');
      } catch (e) {
        console.log(`✗ Failed: ${e.message}\n`);
      }
    } else if (rec.action === 'npm run dev:restart') {
      console.log('→ Restarting dev server...');
      try {
        execSync('npm run dev:restart', { stdio: 'inherit' });
        console.log('✓ Dev server restarted\n');
      } catch (e) {
        console.log(`✗ Failed: ${e.message}\n`);
      }
    } else if (rec.action === 'npm run dev:stop; npm run dev') {
      console.log('→ Stopping all dev servers...');
      try {
        execSync('npm run dev:stop', { stdio: 'inherit' });
        console.log('✓ Dev servers stopped');
        console.log('→ Starting fresh dev server...');
        execSync('npm run dev', { stdio: 'inherit' });
        console.log('✓ Dev server started\n');
      } catch (e) {
        console.log(`✗ Failed: ${e.message}\n`);
      }
    }
  }
}

/**
 * Main
 */
(async () => {
  try {
    const report = await runDiagnostics();

    if (isJSON) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    if (shouldFix && !isJSON) {
      await applyFixes(report);
    }

    process.exit(0);
  } catch (err) {
    console.error('Diagnostics error:', err.message);
    process.exit(1);
  }
})();
