#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);

function getArgValue(name, defaultValue = null) {
  const direct = [...args].reverse().find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const idx = args.lastIndexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return defaultValue;
}

const stableBase = getArgValue('--stable', process.env.AURORA_STABLE_URL || null);
const canaryBase = getArgValue('--canary', process.env.AURORA_CANARY_URL || null);
const outFile = getArgValue('--out', path.join('artifacts', 'api-diagnostics.compare.json'));
const historyFile = getArgValue('--history-out', path.join('artifacts', 'api-diagnostics.compare-history.json'));

if (!stableBase || !canaryBase) {
  console.error('Usage: node scripts/diagnostics-compare.js --stable <url> --canary <url> [--out <file>]');
  process.exit(1);
}

function runDiagnostics(baseUrl) {
  const result = spawnSync('node', ['scripts/api-diagnostics.js', '--json-summary', `--base=${baseUrl}`], {
    shell: true,
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  if (result.status !== 0 && !result.stdout) {
    return { ok: false, error: result.stderr || 'diagnostics failed' };
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    return { ok: false, error: `Unable to parse diagnostics JSON: ${error.message}` };
  }
}

const stable = runDiagnostics(stableBase);
const canary = runDiagnostics(canaryBase);

function getPerf(summary) {
  const perf = summary.checks?.find((check) => check.name === 'perf')?.metrics || null;
  return perf;
}

const stablePerf = getPerf(stable);
const canaryPerf = getPerf(canary);

const compare = {
  timestamp: new Date().toISOString(),
  stable: { baseUrl: stableBase, summary: stable },
  canary: { baseUrl: canaryBase, summary: canary },
  deltas: {
    passed: (canary.totals?.passed || 0) - (stable.totals?.passed || 0),
    failed: (canary.totals?.failed || 0) - (stable.totals?.failed || 0),
    skipped: (canary.totals?.skipped || 0) - (stable.totals?.skipped || 0),
    p95: stablePerf && canaryPerf ? canaryPerf.p95 - stablePerf.p95 : null,
    errorRate: stablePerf && canaryPerf ? canaryPerf.errorRate - stablePerf.errorRate : null,
  },
  ok: !!(stable.ok && canary.ok),
};

const output = JSON.stringify(compare, null, 2);
if (outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, output, 'utf-8');
}

if (historyFile) {
  try {
    const existing = fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile, 'utf-8')) : { items: [] };
    const items = Array.isArray(existing.items) ? existing.items : [];
    const next = {
      items: [...items, compare].slice(-50),
      updatedAt: new Date().toISOString(),
    };
    fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    fs.writeFileSync(historyFile, JSON.stringify(next, null, 2), 'utf-8');
  } catch (error) {
    console.error(`API_COMPARE history write failed: ${error.message}`);
  }
}

console.log(`API_COMPARE status=${compare.ok ? 'pass' : 'fail'} stable=${stableBase} canary=${canaryBase} p95Delta=${compare.deltas.p95 ?? 'n/a'} errorRateDelta=${compare.deltas.errorRate ?? 'n/a'}`);
console.log(output);
process.exit(compare.ok ? 0 : 1);
