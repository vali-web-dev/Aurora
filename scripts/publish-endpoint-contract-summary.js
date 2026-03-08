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

function hasArg(name) {
  return args.includes(name);
}

function appendSummary(lines) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  const outFilePath = getArgValue('--out-file', '').trim();
  const appendOutFile = hasArg('--append-out-file');
  const content = `${lines.join('\n')}\n`;

  if (outFilePath) {
    const outputDir = path.dirname(outFilePath);
    if (outputDir && outputDir !== '.') {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    if (appendOutFile) {
      fs.appendFileSync(outFilePath, content, 'utf8');
    } else {
      fs.writeFileSync(outFilePath, content, 'utf8');
    }
  }

  if (!summaryPath) {
    console.log(lines.join('\n'));
    return;
  }

  fs.appendFileSync(summaryPath, content, 'utf8');
}

function getNumberArgValue(name, defaultValue) {
  const rawValue = getArgValue(name, String(defaultValue));
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) return defaultValue;
  return Math.floor(parsed);
}

function mdInline(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim();
}

function clipText(text, maxChars) {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return '...';
  return `${text.slice(0, Math.max(1, maxChars - 3))}...`;
}

function inferDomain(caseName) {
  const normalized = String(caseName || '').trim().toLowerCase();
  if (!normalized) return 'unknown';

  const token = normalized.split(/\s+/)[0] || '';
  const topLevel = token.split('/')[0] || '';

  if (!topLevel || !/^[a-z0-9_-]+$/i.test(topLevel)) {
    return 'unknown';
  }

  return topLevel;
}

function parseDomainFilter(rawValue) {
  if (!rawValue) return [];

  const unique = new Set(
    String(rawValue)
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)
  );

  return [...unique];
}

function buildDomainCounts(items, sortBy = 'name') {
  const counts = new Map();

  for (const item of items) {
    const domain = inferDomain(item.name);
    counts.set(domain, (counts.get(domain) || 0) + 1);
  }

  const entries = [...counts.entries()];

  if (sortBy === 'count') {
    return entries.sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    });
  }

  return entries.sort((a, b) => a[0].localeCompare(b[0]));
}

function formatDomainLines(domainCounts, total, showPercentages) {
  const safeTotal = total || 1;

  return domainCounts
    .map(([domain, count]) => {
      if (!showPercentages) {
        return `- \`${mdInline(domain)}\` (${count})`;
      }

      const percent = ((count / safeTotal) * 100).toFixed(1).replace(/\.0$/, '');
      return `- \`${mdInline(domain)}\` (${count}, ${percent}%)`;
    })
    .join('\n');
}

function formatDomainObjects(domainCounts) {
  return domainCounts.map(([domain, count]) => ({ domain, count }));
}

function writeJsonSummaryOut(filePath, data, compact = false) {
  if (!filePath) return;

  const outputDir = path.dirname(filePath);
  if (outputDir && outputDir !== '.') {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const payload = compact ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, `${payload}\n`, 'utf8');
}

function toNonNegativeInteger(value, fallbackValue) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallbackValue;
  }

  return Math.floor(parsed);
}

function printHelp() {
  const lines = [
    'Usage: node scripts/publish-endpoint-contract-summary.js [options]',
    '',
    'Options:',
    '  --file <path>                  Report JSON file path (default: artifacts/api-endpoint-contracts.json)',
    '  --title <text>                 Markdown heading title',
    '  --out-file <path>              Write markdown summary to file',
    '  --append-out-file              Append instead of overwrite for --out-file',
    '  --json-summary-out <path>      Write machine-readable summary JSON artifact',
    '  --json-summary-compact         Emit compact (single-line) JSON for --json-summary-out',
    '  --suppress-markdown            Disable markdown output (stdout, step summary, out-file)',
    '  --max-failed-rows <n>          Max failed-case rows in table (default: 12)',
    '  --max-message-chars <n>        Clip failed-case message column length (default: 160)',
    '  --domain-filter <a,b,c>        Restrict failed-case table to selected domains',
    '  --strict-domain-filter         Exit non-zero when domain filter matches zero failed cases',
    '  --show-domains                 Show failed-domain counts section',
    '  --show-domains-only            Show only failed-domain counts and skip failed-case table',
    '  --show-passed-domains          Show passed-domain counts section',
    '  --show-domain-percentages      Show percentage values in domain sections',
    '  --sort-domains-by <name|count> Domain section ordering mode (default: name)',
    '  --fail-on-failed               Exit non-zero when failed cases exist',
    '  --help                         Show this help text',
    '',
  ];

  console.log(lines.join('\n'));
}

function main() {
  if (hasArg('--help')) {
    printHelp();
    return;
  }

  const reportPath = getArgValue('--file', path.join('artifacts', 'api-endpoint-contracts.json'));
  const title = getArgValue('--title', 'API Endpoint Runtime Contracts');
  const maxFailedRows = getNumberArgValue('--max-failed-rows', 12);
  const maxMessageChars = getNumberArgValue('--max-message-chars', 160);
  const domainFilter = parseDomainFilter(getArgValue('--domain-filter', ''));
  const showDomains = hasArg('--show-domains');
  const showDomainsOnly = hasArg('--show-domains-only');
  const showPassedDomains = hasArg('--show-passed-domains');
  const showDomainPercentages = hasArg('--show-domain-percentages');
  const sortDomainsByRaw = String(getArgValue('--sort-domains-by', 'name')).trim().toLowerCase();
  const sortDomainsBy = sortDomainsByRaw === 'count' ? 'count' : 'name';
  const jsonSummaryOut = getArgValue('--json-summary-out', '').trim();
  const jsonSummaryCompact = hasArg('--json-summary-compact');
  const suppressMarkdown = hasArg('--suppress-markdown');
  const failOnFailed = hasArg('--fail-on-failed');
  const strictDomainFilter = hasArg('--strict-domain-filter');

  const emitMarkdown = (lines) => {
    if (suppressMarkdown) return;
    appendSummary(lines);
  };

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

  const reportSummary = report.summary && typeof report.summary === 'object' ? report.summary : null;
  const generatedAt = new Date().toISOString();
  const status = report.status || 'unknown';
  const reportStatusSource = Object.prototype.hasOwnProperty.call(report, 'status') ? 'report.status' : 'default';
  const results = Array.isArray(report.results) ? report.results : [];
  const passedResults = results.filter((result) => result && result.passed === true);
  const failedResults = results.filter((result) => result && result.passed === false);
  const derivedSummary = {
    total: results.length,
    passed: passedResults.length,
    failed: failedResults.length,
  };
  const effectiveSummary = {
    total: toNonNegativeInteger(reportSummary?.total, derivedSummary.total),
    passed: toNonNegativeInteger(reportSummary?.passed, derivedSummary.passed),
    failed: toNonNegativeInteger(reportSummary?.failed, derivedSummary.failed),
  };
  const summarySource = reportSummary ? 'report.summary' : 'derived.results';
  const scopedFailures =
    domainFilter.length === 0
      ? failedResults
      : failedResults.filter((failure) => domainFilter.includes(inferDomain(failure.name)));
  const sortedScopedFailures = [...scopedFailures].sort((a, b) => {
    const domainA = inferDomain(a.name);
    const domainB = inferDomain(b.name);
    if (domainA !== domainB) {
      return domainA.localeCompare(domainB);
    }

    return String(a.name || '').localeCompare(String(b.name || ''));
  });
  const renderedScopedFailures = sortedScopedFailures.slice(0, maxFailedRows);
  const omittedScopedFailures = scopedFailures.length - renderedScopedFailures.length;
  const failedDomainCounts = buildDomainCounts(failedResults, sortDomainsBy);
  const passedDomainCounts = buildDomainCounts(passedResults, sortDomainsBy);
  const allDomainCounts = buildDomainCounts(results, sortDomainsBy);
  const scopedDomainCounts = buildDomainCounts(scopedFailures, sortDomainsBy);

  const jsonSummary = {
    schemaVersion: '1.0.0',
    generatedAt,
    reportPath,
    reportStatusSource,
    summarySource,
    title,
    status,
    summary: {
      total: effectiveSummary.total,
      passed: effectiveSummary.passed,
      failed: effectiveSummary.failed,
    },
    options: {
      domainFilter,
      sortDomainsBy,
      showDomains,
      showDomainsOnly,
      showPassedDomains,
      showDomainPercentages,
      failOnFailed,
      strictDomainFilter,
      jsonSummaryCompact,
      suppressMarkdown,
    },
    domains: {
      all: formatDomainObjects(allDomainCounts),
      passed: formatDomainObjects(passedDomainCounts),
      failed: formatDomainObjects(failedDomainCounts),
    },
    scopedFailures: {
      filterApplied: domainFilter.length > 0,
      matched: scopedFailures.length,
      totalFailed: failedResults.length,
      filteredOut: failedResults.length - scopedFailures.length,
      domainsMatched: scopedDomainCounts.map(([domain]) => domain),
      casesRendered: renderedScopedFailures.length,
      casesOmitted: omittedScopedFailures,
    },
  };

  const lines = [
    `### ${title}`,
    `Status: **${status}**`,
    `- Total: ${effectiveSummary.total}`,
    `- Passed: ${effectiveSummary.passed}`,
    `- Failed: ${effectiveSummary.failed}`,
    ...(domainFilter.length > 0
      ? [`- Domain Filter: ${domainFilter.map((domain) => `\`${domain}\``).join(', ')}`]
      : []),
    '',
  ];

  if (showPassedDomains && !showDomainsOnly) {
    lines.push('#### Passed Domains');
    if (passedResults.length === 0) {
      lines.push('_No passed cases available._');
    } else {
      const passedDomainCounts = buildDomainCounts(passedResults, sortDomainsBy);
      lines.push(formatDomainLines(passedDomainCounts, passedResults.length, showDomainPercentages));
    }
    lines.push('');
  }

  if (failedResults.length > 0) {
    if (showDomains || showDomainsOnly) {
      lines.push('#### Failed Domains');
      lines.push(formatDomainLines(failedDomainCounts, failedResults.length, showDomainPercentages));
      lines.push('');
    }

    if (showDomainsOnly) {
      emitMarkdown(lines);
      writeJsonSummaryOut(jsonSummaryOut, jsonSummary, jsonSummaryCompact);
      if (failOnFailed) {
        process.exitCode = 1;
      }
      return;
    }

    const renderedFailures = renderedScopedFailures;
    const hiddenFailures = omittedScopedFailures;

    if (scopedFailures.length === 0) {
      lines.push('#### Failed Cases');
      lines.push('_No failed cases matched the selected domain filter._');
      lines.push('');
      emitMarkdown(lines);
      writeJsonSummaryOut(jsonSummaryOut, jsonSummary, jsonSummaryCompact);
      if (strictDomainFilter && domainFilter.length > 0) {
        process.exitCode = 1;
      }
      if (failOnFailed) {
        process.exitCode = 1;
      }
      return;
    }

    lines.push('#### Failed Cases');
    lines.push('| Domain | Case | Expected | Actual | Message |');
    lines.push('| --- | --- | --- | --- | --- |');

    for (const failure of renderedFailures) {
      const domain = inferDomain(failure.name);
      const expected = `status ${mdInline(failure.expectedStatus ?? 'n/a')}`;
      const actual = `status ${mdInline(failure.actualStatus ?? 'n/a')}`;
      const message = clipText(
        mdInline(
        failure.message || failure.actualError || failure.expectedErrorIncludes || 'No failure details provided'
        ),
        maxMessageChars
      );

      lines.push(
        `| ${mdInline(domain)} | ${mdInline(failure.name || 'unnamed-case')} | ${expected} | ${actual} | ${message} |`
      );
    }

    if (hiddenFailures > 0) {
      lines.push('');
      lines.push(`_${hiddenFailures} additional failed case(s) omitted. Re-run with --max-failed-rows to expand._`);
    }

    lines.push('');
  }

  emitMarkdown(lines);
  writeJsonSummaryOut(jsonSummaryOut, jsonSummary, jsonSummaryCompact);

  if (failOnFailed && failedResults.length > 0) {
    process.exitCode = 1;
  }
}

main();
