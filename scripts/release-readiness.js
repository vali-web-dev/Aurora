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

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

const buildSummaryPath = getArgValue('--build', path.join('build-summary.json'));
const apiSummaryPath = getArgValue('--api', path.join('artifacts', 'api-diagnostics.json'));
const platformSummaryPath = getArgValue('--platform', path.join('.aurora', 'platform-diag-history', 'latest.json'));
const outFile = getArgValue('--out', path.join('artifacts', 'release-readiness.json'));

const buildSummary = readJson(buildSummaryPath);
const apiSummary = readJson(apiSummaryPath);
const platformSummary = readJson(platformSummaryPath);

let score = 100;
const signals = [];

if (buildSummary) {
  const buildOk = buildSummary.ok ?? true;
  if (!buildOk) {
    score -= 40;
    signals.push('build_failed');
  }
} else {
  score -= 10;
  signals.push('build_summary_missing');
}

if (apiSummary) {
  if (!apiSummary.ok) {
    score -= 30;
    signals.push('api_diagnostics_failed');
  }
  const failed = apiSummary.totals?.failed || 0;
  score -= Math.min(20, failed * 5);
} else {
  score -= 10;
  signals.push('api_summary_missing');
}

if (platformSummary) {
  if (!platformSummary.ok) {
    score -= 20;
    signals.push('platform_diagnostics_failed');
  }
  const failed = platformSummary.totals?.failed || 0;
  score -= Math.min(20, failed * 5);
} else {
  score -= 10;
  signals.push('platform_summary_missing');
}

score = Math.max(0, Math.min(100, score));
const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

const report = {
  timestamp: new Date().toISOString(),
  score,
  grade,
  signals,
  buildSummaryPath,
  apiSummaryPath,
  platformSummaryPath,
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');
console.log(`RELEASE_READINESS score=${score} grade=${grade}`);
console.log(JSON.stringify(report, null, 2));
process.exit(score >= 80 ? 0 : 1);
