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

function mdInline(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function main() {
  const reportPath = getArgValue('--file', path.join('artifacts', 'api-endpoint-contracts.json'));
  const title = getArgValue('--title', 'API Endpoint Runtime Contracts');

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
  } catch {
    appendSummary([
      `### ${title}`,
      `Failed to parse report: ${reportPath}`,
      '',
    ]);
    return;
  }

  const summary = report.summary || {};
  const status = report.status || 'unknown';
  const results = Array.isArray(report.results) ? report.results : [];
  const failedResults = results.filter((result) => result && result.passed === false);

  const lines = [
    `### ${title}`,
    `Status: **${status}**`,
    `- Total: ${summary.total ?? 'n/a'}`,
    `- Passed: ${summary.passed ?? 'n/a'}`,
    `- Failed: ${summary.failed ?? 'n/a'}`,
    '',
  ];

  if (failedResults.length > 0) {
    lines.push('#### Failed Cases');
    lines.push('| Case | Expected | Actual | Message |');
    lines.push('| --- | --- | --- | --- |');

    for (const failure of failedResults) {
      const expected = `status ${mdInline(failure.expectedStatus ?? 'n/a')}`;
      const actual = `status ${mdInline(failure.actualStatus ?? 'n/a')}`;
      const message = mdInline(
        failure.message || failure.actualError || failure.expectedErrorIncludes || 'No failure details provided'
      );

      lines.push(
        `| ${mdInline(failure.name || 'unnamed-case')} | ${expected} | ${actual} | ${message} |`
      );
    }

    lines.push('');
  }

  appendSummary(lines);
}

main();
