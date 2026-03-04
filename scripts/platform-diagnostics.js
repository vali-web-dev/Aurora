#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { spawn, spawnSync } = require('child_process');

const args = process.argv.slice(2);

function hasFlag(flag) {
  return args.includes(flag);
}

function getArgValue(name, defaultValue = null) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return defaultValue;
}

function getListArg(name, defaultValue = []) {
  const raw = getArgValue(name);
  if (!raw) return defaultValue;
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const allowDbSkip = hasFlag('--allow-db-skip') || process.env.PLATFORM_DIAG_ALLOW_DB_SKIP === '1';
const summaryMode = hasFlag('--summary');
const jsonSummaryMode = hasFlag('--json-summary');
const asJson = hasFlag('--json') || jsonSummaryMode;
const ndjsonMode = hasFlag('--ndjson');
const traceMode = hasFlag('--trace');
const autoStartDev = hasFlag('--auto-start-dev');
const autoStartTimeoutSec = Number(getArgValue('--auto-start-timeout', '20'));
const outFile = getArgValue('--out');
const htmlOut = getArgValue('--html-out');
const webhookUrl = getArgValue('--webhook-url', process.env.PLATFORM_DIAG_WEBHOOK_URL || null);
const historyDir = getArgValue('--history-dir', path.join('.aurora', 'platform-diag-history'));
const ghaSummaryPath = hasFlag('--gha-summary')
  ? getArgValue('--gha-summary', process.env.GITHUB_STEP_SUMMARY || null)
  : process.env.GITHUB_STEP_SUMMARY || null;
const junitOut = getArgValue(
  '--junit',
  hasFlag('--junit') ? path.join('artifacts', 'platform-diagnostics.junit.xml') : null
);
const ports = getListArg('--ports', ['3000', '3001', '3002', '3003', '3004', '3005'])
  .map((value) => Number(value))
  .filter((value) => Number.isFinite(value));

function run(name, command, commandArgs) {
  const startedAt = Date.now();
  const result = spawnSync(command, commandArgs, {
    shell: true,
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  return {
    name,
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - startedAt,
    startedAt,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function parseJsonLoose(value) {
  if (!value) return null;
  const firstBrace = value.indexOf('{');
  if (firstBrace < 0) return null;
  const raw = value.slice(firstBrace);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeResult(result) {
  if (result.name !== 'db') return result;

  const parsed = parseJsonLoose(result.stdout);
  const errorText = `${result.stderr}\n${result.stdout}`;
  const networkDown = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(errorText);
  const unhealthy = parsed && parsed.status === 'unhealthy';

  if (allowDbSkip && (!result.ok || unhealthy) && networkDown) {
    return {
      ...result,
      ok: true,
      skipped: true,
      note: 'DB check skipped due to transient network resolution/connectivity failure.',
      exitCode: 0,
    };
  }

  return result;
}

function httpRequest(targetUrl, requestTimeoutMs = 1500) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      resolve({ ok: false, status: 'bad_url', elapsed: 0 });
      return;
    }

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(
      {
        method: 'GET',
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        timeout: requestTimeoutMs,
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 400,
            status: res.statusCode,
            elapsed: Date.now() - startedAt,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 'timeout', elapsed: requestTimeoutMs });
    });

    req.on('error', (error) => {
      resolve({ ok: false, status: error.code || 'error', elapsed: Date.now() - startedAt });
    });

    req.end();
  });
}

async function resolveBaseUrl() {
  for (const port of ports) {
    const base = `http://localhost:${port}`;
    const check = await httpRequest(`${base}/api/health`, 1200);
    if (check.ok || (typeof check.status === 'number' && check.status < 500)) return base;
  }
  return null;
}

async function maybeAutoStartDev() {
  if (!autoStartDev) return null;

  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(cmd, ['run', 'dev'], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
    shell: true,
  });
  child.unref();

  const startedAt = Date.now();
  const maxWaitMs = Math.max(3000, autoStartTimeoutSec * 1000);
  while (Date.now() - startedAt < maxWaitMs) {
    const baseUrl = await resolveBaseUrl();
    if (baseUrl) return baseUrl;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return null;
}

function readLatestHistory() {
  const latestFile = path.join(historyDir, 'latest.json');
  if (!fs.existsSync(latestFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
  } catch {
    return null;
  }
}

function writeHistory(summary) {
  fs.mkdirSync(historyDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(historyDir, `platform-diag-${ts}.json`);
  fs.writeFileSync(file, JSON.stringify(summary, null, 2), 'utf-8');
  fs.writeFileSync(path.join(historyDir, 'latest.json'), JSON.stringify(summary, null, 2), 'utf-8');
}

function buildDiff(previous, current) {
  if (!previous) return null;
  return {
    passedDelta: current.totals.passed - (previous.totals?.passed || 0),
    failedDelta: current.totals.failed - (previous.totals?.failed || 0),
    skippedDelta: current.totals.skipped - (previous.totals?.skipped || 0),
    durationDelta: current.totals.durationMs - (previous.totals?.durationMs || 0),
  };
}

function toJUnit(summary) {
  const total = summary.checks.length;
  const failures = summary.checks.filter((check) => !check.ok && !check.skipped).length;
  const skipped = summary.checks.filter((check) => check.skipped).length;
  const testcases = summary.checks
    .map((check) => {
      const attrs = `name="${check.name}" time="${(check.durationMs || 0) / 1000}"`;
      if (check.skipped) {
        return `<testcase ${attrs}><skipped message="${escapeXml(check.note || 'skipped')}"/></testcase>`;
      }
      if (!check.ok) {
        return `<testcase ${attrs}><failure message="exitCode=${check.exitCode || 1}"/></testcase>`;
      }
      return `<testcase ${attrs}/>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="platform-diagnostics" tests="${total}" failures="${failures}" skipped="${skipped}">${testcases}</testsuite>\n`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownSummary(summary, title = 'Platform Diagnostics Summary') {
  const lines = [];
  lines.push(`## ${title}`);
  lines.push('');
  lines.push(`- Status: **${summary.ok ? 'PASS' : 'FAIL'}**`);
  lines.push(`- Passed: ${summary.totals.passed}`);
  lines.push(`- Failed: ${summary.totals.failed}`);
  lines.push(`- Skipped: ${summary.totals.skipped}`);
  lines.push(`- Allow DB Skip: ${summary.allowDbSkip}`);
  lines.push('');
  lines.push('| Check | Status | Duration (ms) |');
  lines.push('|---|---:|---:|');
  for (const check of summary.checks) {
    const status = check.skipped ? 'skipped' : check.ok ? 'ok' : 'failed';
    lines.push(`| ${check.name} | ${status} | ${check.durationMs || 0} |`);
  }
  lines.push('');
  return lines.join('\n');
}

async function sendWebhook(summary) {
  if (!webhookUrl || summary.ok) return;

  try {
    const payload = JSON.stringify({
      text: `Platform diagnostics failed (${summary.exitReason})`,
      summary: {
        ok: summary.ok,
        totals: summary.totals,
        allowDbSkip: summary.allowDbSkip,
        exitReason: summary.exitReason,
      },
    });

    await new Promise((resolve) => {
      const parsed = new URL(webhookUrl);
      const transport = parsed.protocol === 'https:' ? https : http;
      const req = transport.request(
        {
          method: 'POST',
          hostname: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname + parsed.search,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 5000,
        },
        () => resolve()
      );
      req.on('error', () => resolve());
      req.on('timeout', () => {
        req.destroy();
        resolve();
      });
      req.write(payload);
      req.end();
    });
  } catch {}
}

function emitGitHubAnnotations(summary) {
  if (process.env.GITHUB_ACTIONS !== 'true') return;

  for (const check of summary.checks) {
    if (check.ok || check.skipped) continue;
    console.log(`::error title=Platform Diagnostics::${check.name} failed (exitCode=${check.exitCode || 1})`);
  }

  if (!summary.ok) {
    console.log(`::error title=Platform Diagnostics::exitReason=${summary.exitReason}`);
  }
}

function renderHtmlReport(summary) {
  const rows = summary.checks
    .map((check) => {
      const status = check.skipped ? 'skipped' : check.ok ? 'ok' : 'failed';
      const note = check.note ? `<div class="note">${check.note}</div>` : '';
      return `<tr class="${status}"><td>${check.name}</td><td>${status}</td><td>${check.durationMs || 0}</td><td>${note}</td></tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Platform Diagnostics Report</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; font-family: "Space Grotesk", "Sora", "Segoe UI", sans-serif; background: #f6f5f1; color: #1f2328; }
  header { padding: 32px 40px; background: radial-gradient(circle at top, #f5e9d7, #f6f5f1); }
  h1 { margin: 0 0 8px; font-size: 28px; }
  .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
  tr.ok td { color: #0f5d4d; }
  tr.failed td { color: #b42318; }
  tr.skipped td { color: #9b8b20; }
  .note { font-size: 12px; color: #6b7280; }
</style>
</head>
<body>
<header>
  <h1>Platform Diagnostics</h1>
  <div>Timestamp: ${summary.timestamp}</div>
</header>
<main style="padding: 24px 40px;">
  <section class="grid">
    <div class="card"><strong>Status</strong><div>${summary.ok ? 'PASS' : 'FAIL'}</div></div>
    <div class="card"><strong>Passed</strong><div>${summary.totals.passed}</div></div>
    <div class="card"><strong>Failed</strong><div>${summary.totals.failed}</div></div>
    <div class="card"><strong>Skipped</strong><div>${summary.totals.skipped}</div></div>
  </section>
  <section style="margin-top: 24px;" class="card">
    <h2 style="margin-top: 0;">Checks</h2>
    <table>
      <thead><tr><th>Check</th><th>Status</th><th>Duration (ms)</th><th>Notes</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>
</main>
</body>
</html>`;
}

function writeFileSafe(filePath, contents) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf-8');
}

function buildExitReason(summary) {
  if (summary.totals.failed > 0) return 'CHECK_FAIL';
  return 'OK';
}

function printSummary(summary) {
  if (ndjsonMode) {
    for (const check of summary.checks) {
      console.log(JSON.stringify({ type: 'check', name: check.name, ok: check.ok, skipped: !!check.skipped, durationMs: check.durationMs }));
    }
    console.log(JSON.stringify({ type: 'summary', ok: summary.ok, totals: summary.totals, exitReason: summary.exitReason }));
    return;
  }

  if (asJson) {
    if (jsonSummaryMode) {
      const output = {
        timestamp: summary.timestamp,
        ok: summary.ok,
        allowDbSkip: summary.allowDbSkip,
        totals: summary.totals,
        checks: summary.checks.map((check) => ({
          name: check.name,
          ok: check.ok,
          skipped: !!check.skipped,
          exitCode: check.exitCode,
          durationMs: check.durationMs,
        })),
        exitReason: summary.exitReason,
        diff: summary.diff || null,
      };
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(JSON.stringify(summary, null, 2));
    }
    return;
  }

  if (summaryMode) {
    const status = summary.ok ? 'pass' : 'fail';
    console.log(
      `PLATFORM_DIAG status=${status} passed=${summary.totals.passed} failed=${summary.totals.failed} skipped=${summary.totals.skipped} allowDbSkip=${summary.allowDbSkip} durationMs=${summary.totals.durationMs} exitReason=${summary.exitReason}`
    );
    console.log(
      `PLATFORM_DIAG_CHECKS ${summary.checks
        .map((check) => `${check.name}:${check.skipped ? 'skipped' : check.ok ? 'ok' : 'fail'}`)
        .join(' ')}`
    );
    if (traceMode) {
      console.log(
        `PLATFORM_DIAG_TRACE ${summary.checks
          .map((check) => `${check.name}:${check.durationMs || 0}ms`)
          .join(' ')}`
      );
    }
    return;
  }

  console.log('\n============================================================');
  console.log('PLATFORM DIAGNOSTICS');
  console.log('============================================================');
  for (const check of summary.checks) {
    if (check.skipped) {
      console.log(`• ${check.name} (skipped)`);
      console.log(`  ${check.note || ''}`);
      continue;
    }
    console.log(`${check.ok ? '✓' : '✗'} ${check.name} (${check.durationMs || 0}ms)`);
  }
  if (summary.diff) {
    console.log('------------------------------------------------------------');
    console.log(
      `Diff vs last: passed ${summary.diff.passedDelta >= 0 ? '+' : ''}${summary.diff.passedDelta}, failed ${summary.diff.failedDelta >= 0 ? '+' : ''}${summary.diff.failedDelta}, skipped ${summary.diff.skippedDelta >= 0 ? '+' : ''}${summary.diff.skippedDelta}`
    );
  }
  console.log('------------------------------------------------------------');
  console.log(`Passed: ${summary.totals.passed}, Failed: ${summary.totals.failed}, Skipped: ${summary.totals.skipped}`);
  console.log(`Exit Reason: ${summary.exitReason}`);
  console.log(`Total duration: ${summary.totals.durationMs}ms`);
  console.log('============================================================\n');
}

async function main() {
  let baseUrl = await resolveBaseUrl();
  if (!baseUrl && autoStartDev) {
    baseUrl = await maybeAutoStartDev();
  }

  const checks = [
    ['dev', 'node', ['scripts/dev-diagnostics.js', '--json']],
    ['db', 'node', ['scripts/db-health-simple.js', '--json']],
    ['api', 'node', ['scripts/api-diagnostics.js', '--strict', '--allow-skip', '--json-summary']],
  ];

  const started = Date.now();
  const rawResults = checks.map(([name, cmd, argsList]) => run(name, cmd, argsList));
  const results = rawResults.map(normalizeResult);
  const summary = {
    timestamp: new Date().toISOString(),
    ok: results.every((item) => item.ok),
    allowDbSkip,
    baseUrl,
    totals: {
      passed: results.filter((item) => item.ok).length,
      failed: results.filter((item) => !item.ok).length,
      skipped: results.filter((item) => item.skipped).length,
      durationMs: Date.now() - started,
    },
    checks: results,
  };

  summary.exitReason = buildExitReason(summary);

  const previous = readLatestHistory();
  summary.diff = buildDiff(previous, summary);
  writeHistory(summary);

  if (outFile) {
    const payload = jsonSummaryMode
      ? {
          timestamp: summary.timestamp,
          ok: summary.ok,
          allowDbSkip: summary.allowDbSkip,
          totals: summary.totals,
          checks: summary.checks.map((check) => ({
            name: check.name,
            ok: check.ok,
            skipped: !!check.skipped,
            exitCode: check.exitCode,
            durationMs: check.durationMs,
          })),
          exitReason: summary.exitReason,
          diff: summary.diff || null,
        }
      : summary;
    writeFileSafe(outFile, JSON.stringify(payload, null, 2));
  }

  if (htmlOut) {
    writeFileSafe(htmlOut, renderHtmlReport(summary));
  }

  if (junitOut) {
    writeFileSafe(junitOut, toJUnit(summary));
  }

  if (ghaSummaryPath) {
    writeFileSafe(ghaSummaryPath, markdownSummary(summary, 'Platform Diagnostics'));
  }

  emitGitHubAnnotations(summary);
  await sendWebhook(summary);

  printSummary(summary);
  process.exit(summary.ok ? 0 : 1);
}

main().catch((error) => {
  console.error('Platform diagnostics failed:', error.message);
  process.exit(1);
});
