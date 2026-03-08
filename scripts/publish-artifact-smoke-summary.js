#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function getArgValue(name, defaultValue = null) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return defaultValue;
}

function appendSummary(lines) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    console.log(lines.join('\n'));
    return;
  }

  fs.appendFileSync(summaryPath, `${lines.join('\n')}\n`, 'utf8');
}

function main() {
  const reportPath = getArgValue('--file', path.join('artifacts', 'artifact-storage-smoke.json'));
  const title = getArgValue('--title', 'Artifact Storage Smoke');

  if (!fs.existsSync(reportPath)) {
    appendSummary([
      `### ${title}`,
      `Report file missing: ${reportPath}`,
      '',
    ]);
    return;
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (error) {
    appendSummary([
      `### ${title}`,
      `Failed to parse report: ${reportPath}`,
      '',
    ]);
    return;
  }

  const checks = Array.isArray(report.checks) ? report.checks : [];
  const lines = [
    `### ${title}`,
    `Status: **${report.status || 'unknown'}**`,
    ...checks.map((check) => {
      const duration = typeof check.durationMs === 'number' ? `${check.durationMs}ms` : 'n/a';
      return `- ${check.name || 'unknown'}: ${check.status || 'unknown'} (${duration})`;
    }),
    '',
  ];

  appendSummary(lines);
}

main();
