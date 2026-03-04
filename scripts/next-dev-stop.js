const { spawnSync } = require('node:child_process');

if (process.platform !== 'win32') {
  console.log('[dev:stop] This script currently targets Windows only.');
  process.exit(0);
}

const command = [
  "$cwd=(Get-Location).Path",
  "$targets=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'next dev' -and $_.CommandLine -like \"*$cwd*\" }",
  "$count=($targets | Measure-Object).Count",
  "$targets | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }",
  "Write-Output $count",
].join('; ');

const result = spawnSync('powershell', ['-NoProfile', '-Command', command], {
  cwd: process.cwd(),
  encoding: 'utf8',
});

const stopped = Number((result.stdout || '').trim()) || 0;
console.log(`[dev:stop] Stopped ${stopped} next dev process(es).`);
