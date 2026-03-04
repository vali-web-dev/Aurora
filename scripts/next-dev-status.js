const { spawnSync } = require('node:child_process');

function run(command) {
  const result = spawnSync('powershell', ['-NoProfile', '-Command', command], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  return (result.stdout || '').trim();
}

const processQuery = [
  "$cwd=(Get-Location).Path",
  "$targets=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'next dev' -and $_.CommandLine -like \"*$cwd*\" }",
  "$targets | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress",
].join('; ');

let targets = [];
try {
  const raw = run(processQuery);
  if (raw) {
    const parsed = JSON.parse(raw);
    targets = Array.isArray(parsed) ? parsed : [parsed];
  }
} catch {
  targets = [];
}

const healthCommand = "node scripts/check-dev-health.js --json";
const healthRaw = run(healthCommand);
let health = null;
try {
  health = JSON.parse(healthRaw);
} catch {
  health = { healthy: null, results: [] };
}

if (targets.length === 0) {
  console.log('[dev:status] No next dev process found for this workspace.');
} else {
  console.log(`[dev:status] Found ${targets.length} process(es):`);
  targets.forEach((entry) => {
    console.log(`- PID ${entry.ProcessId}: ${entry.CommandLine}`);
  });
}

if (health.healthy) {
  console.log(`[dev:status] Healthy endpoint: ${health.healthy}`);
} else {
  console.log('[dev:status] No healthy endpoint detected on 3000-3005');
}
