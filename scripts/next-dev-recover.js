const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');

const ROOT = process.cwd();
const LOCK_PATH = path.join(ROOT, '.next-dev', 'dev', 'lock');
const CANDIDATE_PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

function parseArgs(argv) {
  const args = { forceRestart: false, preferredPort: null, customServer: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--force-restart') args.forceRestart = true;
    if (token === '--custom-server') args.customServer = true;
    if (token === '--port') {
      const next = Number(argv[index + 1]);
      if (Number.isInteger(next) && next > 0) args.preferredPort = next;
      index += 1;
    }
  }
  return args;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

function requestHealth(port, targetPath) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: targetPath,
        timeout: 2500,
      },
      (res) => {
        resolve(Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 500));
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });
}

async function checkHealth(port) {
  const apiHealth = await requestHealth(port, '/api/health');
  if (apiHealth) return { ok: true, path: '/api/health' };

  const legacyHealth = await requestHealth(port, '/health');
  if (legacyHealth) return { ok: true, path: '/health' };

  return { ok: false, path: '/api/health' };
}

function clearLock() {
  if (fs.existsSync(LOCK_PATH)) {
    try {
      fs.rmSync(LOCK_PATH, { force: true });
      console.log(`[dev:recover] Removed stale lock: ${LOCK_PATH}`);
    } catch (error) {
      console.warn('[dev:recover] Could not remove lock file:', error.message);
    }
  }
}

function killStaleNextDevWindows(customServer) {
  if (process.platform !== 'win32') return;
  const processPattern = customServer ? '(next dev|server\\.js)' : 'next dev';
  const command = [
    "$cwd=(Get-Location).Path",
    `$targets=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match '${processPattern}' -and $_.CommandLine -like \"*$cwd*\" }`,
    "$targets | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }",
  ].join('; ');

  try {
    spawnSync('powershell', ['-NoProfile', '-Command', command], {
      cwd: ROOT,
      stdio: 'ignore',
    });
  } catch {
    // Best effort only
  }
}

function listStaleNextDevWindows(customServer) {
  if (process.platform !== 'win32') return [];
  const processPattern = customServer ? '(next dev|server\\.js)' : 'next dev';
  const command = [
    "$cwd=(Get-Location).Path",
    `$targets=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match '${processPattern}' -and $_.CommandLine -like \"*$cwd*\" }`,
    "$targets | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress",
  ].join('; ');

  try {
    const result = spawnSync('powershell', ['-NoProfile', '-Command', command], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    const raw = (result.stdout || '').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function findOpenPort() {
  for (const port of CANDIDATE_PORTS) {
    const open = await isPortAvailable(port);
    if (open) return port;
  }
  return null;
}

async function main() {
  const { forceRestart, preferredPort, customServer } = parseArgs(process.argv.slice(2));
  const candidatePorts = preferredPort ? [preferredPort, ...CANDIDATE_PORTS.filter((port) => port !== preferredPort)] : CANDIDATE_PORTS;

  if (!forceRestart) {
    for (const port of candidatePorts) {
      const health = await checkHealth(port);
      if (health.ok) {
        console.log(`[dev:recover] Existing dev server detected: http://localhost:${port}${health.path}`);
        process.exit(0);
      }
    }
  }

  if (forceRestart) {
    const matches = listStaleNextDevWindows(customServer);
    if (matches.length > 0) {
      console.log(`[dev:recover] force-restart enabled; stopping ${matches.length} existing dev process(es)`);
    }
  }

  killStaleNextDevWindows(customServer);
  await wait(600);
  clearLock();

  const port = preferredPort && (await isPortAvailable(preferredPort)) ? preferredPort : await findOpenPort();
  if (!port) {
    console.error('[dev:recover] No open ports available in 3000-3005');
    process.exit(1);
  }

  const localNextBin = process.platform === 'win32'
    ? path.join(ROOT, 'node_modules', '.bin', 'next.cmd')
    : path.join(ROOT, 'node_modules', '.bin', 'next');
  const localTsxBin = process.platform === 'win32'
    ? path.join(ROOT, 'node_modules', '.bin', 'tsx.cmd')
    : path.join(ROOT, 'node_modules', '.bin', 'tsx');

  const nextCmd = fs.existsSync(localNextBin) ? localNextBin : (process.platform === 'win32' ? 'npx.cmd' : 'npx');
  const tsxCmd = fs.existsSync(localTsxBin) ? localTsxBin : (process.platform === 'win32' ? 'npx.cmd' : 'npx');

  const command = customServer ? tsxCmd : nextCmd;
  const commandArgs = customServer
    ? (fs.existsSync(localTsxBin) ? ['server.js'] : ['tsx', 'server.js'])
    : (fs.existsSync(localNextBin)
      ? ['dev', '--webpack', '-p', String(port)]
      : ['next', 'dev', '--webpack', '-p', String(port)]);

  console.log(`[dev:recover] Starting ${customServer ? 'custom dev server' : 'next dev'} on port ${port}`);

  const child = spawn(command, commandArgs, {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      NEXT_DIST_DIR: '.next-dev',
      NEXT_DISABLE_CACHE: '1',
    },
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  child.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  child.on('error', (error) => {
    console.error('[dev:recover] Failed to spawn dev server process:', error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[dev:recover] Failed to start dev server:', error);
  process.exit(1);
});
