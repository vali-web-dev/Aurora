#!/usr/bin/env node

const fs = require('fs');

const GATE_PROFILES = {
  strict: { maxAttempts: 1, maxTotalMs: 180000 },
  balanced: { maxAttempts: 1, maxTotalMs: 300000 },
  lenient: { maxAttempts: 2, maxTotalMs: 480000 },
};

function parseArgs(argv) {
  const args = {
    file: null,
    json: false,
    markdown: false,
    githubSummary: false,
    out: null,
    profile: null,
    maxAttempts: null,
    maxTotalMs: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--file' && argv[index + 1]) {
      args.file = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--profile' && argv[index + 1]) {
      args.profile = String(argv[index + 1]).toLowerCase();
      index += 1;
      continue;
    }

    if (token === '--out' && argv[index + 1]) {
      args.out = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--github-summary') {
      args.githubSummary = true;
      continue;
    }

    if (token === '--max-attempts' && argv[index + 1]) {
      args.maxAttempts = Number.parseInt(argv[index + 1], 10);
      index += 1;
      continue;
    }

    if (token === '--max-total-ms' && argv[index + 1]) {
      args.maxTotalMs = Number.parseInt(argv[index + 1], 10);
      index += 1;
      continue;
    }

    if (token === '--json') {
      args.json = true;
      continue;
    }

    if (token === '--markdown') {
      args.markdown = true;
    }
  }
  return args;
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function readInput(filePath) {
  if (filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  return fs.readFileSync(0, 'utf8');
}

function parseEvents(raw) {
  const events = [];
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      continue;
    }

    try {
      const value = JSON.parse(trimmed);
      if (value && value.source === 'next-build-retry' && typeof value.event === 'string') {
        events.push(value);
      }
    } catch (_) {
      // ignore non-JSON lines
    }
  }

  return events;
}

function summarize(events) {
  const lockWaitStarted = events.some((event) => event.event === 'lock_wait_started');
  const staleLockRecovered = events.some((event) => event.event === 'lock_stale_removed');
  const lockAcquired = events.find((event) => event.event === 'lock_acquired');
  const attemptFinished = events.filter((event) => event.event === 'attempt_finished');
  const buildSucceeded = events.find((event) => event.event === 'build_succeeded');
  const buildFailed = events.find((event) => event.event === 'build_failed');

  const firstFailedAttempt = attemptFinished.find((attempt) => Number(attempt.exitCode) !== 0);
  const finalAttempt = attemptFinished[attemptFinished.length - 1];
  const status = buildSucceeded ? 'success' : 'failed';
  const attemptsUsed = Number(
    (buildSucceeded && buildSucceeded.attemptsUsed) ||
      (buildFailed && buildFailed.attemptsUsed) ||
      (finalAttempt && finalAttempt.attempt) ||
      0
  );
  const totalMs = Number(
    (buildSucceeded && buildSucceeded.elapsedMs) ||
      (buildFailed && buildFailed.elapsedMs) ||
      0
  );
  const retryUsed = attemptsUsed > 1 || attemptFinished.some((attempt) => Number(attempt.exitCode) !== 0);
  const lockWaitMs = Number((lockAcquired && lockAcquired.waitedMs) || 0);
  const firstFailureMs = Number((firstFailedAttempt && firstFailedAttempt.elapsedMs) || 0);

  return {
    status,
    attemptsUsed,
    totalMs,
    retryUsed,
    firstFailureMs,
    lockWaitStarted,
    lockWaitMs,
    staleLockRecovered,
    eventsParsed: events.length,
  };
}

function evaluateGates(summary, options) {
  const failures = [];

  if (Number.isInteger(options.maxAttempts) && options.maxAttempts > 0) {
    if (summary.attemptsUsed > options.maxAttempts) {
      failures.push({
        key: 'maxAttempts',
        actual: summary.attemptsUsed,
        expectedMax: options.maxAttempts,
      });
    }
  }

  if (Number.isInteger(options.maxTotalMs) && options.maxTotalMs > 0) {
    if (summary.totalMs > options.maxTotalMs) {
      failures.push({
        key: 'maxTotalMs',
        actual: summary.totalMs,
        expectedMax: options.maxTotalMs,
      });
    }
  }

  return failures;
}

function computeBadgeStatus(summary, gatedStatus) {
  if (gatedStatus === 'failed' || summary.status === 'failed') {
    return 'failed';
  }

  if (summary.retryUsed || summary.attemptsUsed > 1) {
    return 'retried';
  }

  return 'stable';
}

function buildBadgeLine(output) {
  return [
    'BUILD_BADGE',
    `status=${output.badgeStatus}`,
    `gateStatus=${output.gateStatus}`,
    `profile=${output.thresholds.profile || 'none'}`,
    `attemptsUsed=${output.attemptsUsed}`,
    `totalMs=${output.totalMs}`,
  ].join(' ');
}

function buildMarkdownReport(output) {
  const thresholdProfile = output.thresholds.profile || 'none';
  const maxAttempts = output.thresholds.maxAttempts ?? 'unset';
  const maxTotalMs = output.thresholds.maxTotalMs ?? 'unset';
  const retryText = output.retryUsed ? 'yes' : 'no';
  const lockWaitText = output.lockWaitStarted ? 'yes' : 'no';
  const staleLockText = output.staleLockRecovered ? 'yes' : 'no';

  const lines = [
    '# Build Telemetry Report',
    '',
    `- Status: **${output.status}**`,
    `- Badge status: **${output.badgeStatus}**`,
    `- Gate status: **${output.gateStatus}**`,
    `- Attempts used: **${output.attemptsUsed}**`,
    `- Total duration (ms): **${output.totalMs}**`,
    `- Retry used: **${retryText}**`,
    `- First failure duration (ms): **${output.firstFailureMs}**`,
    `- Lock wait started: **${lockWaitText}**`,
    `- Lock wait (ms): **${output.lockWaitMs}**`,
    `- Stale lock recovered: **${staleLockText}**`,
    `- Events parsed: **${output.eventsParsed}**`,
    '',
    '## Gate Configuration',
    '',
    `- Profile: **${thresholdProfile}**`,
    `- Max attempts: **${maxAttempts}**`,
    `- Max total ms: **${maxTotalMs}**`,
    '',
  ];

  if (output.gateFailures.length > 0) {
    lines.push('## Gate Failures', '');
    for (const failure of output.gateFailures) {
      lines.push(
        `- ${failure.key}: actual=${failure.actual}, expectedMax=${failure.expectedMax}`
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

function publishGithubSummary(markdown) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    throw new Error('GITHUB_STEP_SUMMARY is not set');
  }

  const payload = `${markdown}\n`;
  fs.appendFileSync(summaryPath, payload, 'utf8');
  return summaryPath;
}

function resolveThresholds(args) {
  const profileName = args.profile ?? (process.env.BUILD_GATE_PROFILE ? String(process.env.BUILD_GATE_PROFILE).toLowerCase() : null);
  const profile = profileName && GATE_PROFILES[profileName] ? GATE_PROFILES[profileName] : null;

  const maxAttempts =
    args.maxAttempts ??
    (profile ? profile.maxAttempts : null) ??
    parsePositiveInt(process.env.BUILD_GATE_MAX_ATTEMPTS);

  const maxTotalMs =
    args.maxTotalMs ??
    (profile ? profile.maxTotalMs : null) ??
    parsePositiveInt(process.env.BUILD_GATE_MAX_TOTAL_MS);

  return {
    profileName,
    maxAttempts,
    maxTotalMs,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { profileName, maxAttempts, maxTotalMs } = resolveThresholds(args);
  const raw = readInput(args.file);
  const events = parseEvents(raw);

  if (events.length === 0) {
    if (args.json) {
      console.log(JSON.stringify({ source: 'build-summary', status: 'unknown', reason: 'no-events' }));
    } else {
      console.error('BUILD_SUMMARY status=unknown reason=no-events');
    }
    process.exit(1);
  }

  const summary = summarize(events);
  const gateFailures = evaluateGates(summary, { maxAttempts, maxTotalMs });
  const gatedStatus = gateFailures.length > 0 ? 'failed' : summary.status;
  const badgeStatus = computeBadgeStatus(summary, gatedStatus);
  const output = {
    source: 'build-summary',
    ...summary,
    badgeStatus,
    thresholds: {
      profile: profileName,
      maxAttempts,
      maxTotalMs,
    },
    gateStatus: gatedStatus,
    gateFailures,
  };

  if (args.json) {
    console.log(JSON.stringify(output));
  } else if (args.markdown) {
    const markdown = buildMarkdownReport(output);
    if (args.out) {
      fs.writeFileSync(args.out, markdown, 'utf8');
      console.log(`BUILD_SUMMARY_REPORT file=${args.out}`);
    } else {
      console.log(markdown);
    }
  } else {
  const line = [
    'BUILD_SUMMARY',
    `status=${summary.status}`,
    `gateStatus=${gatedStatus}`,
    `profile=${profileName || 'none'}`,
    `attemptsUsed=${summary.attemptsUsed}`,
    `totalMs=${summary.totalMs}`,
    `retryUsed=${summary.retryUsed}`,
    `firstFailureMs=${summary.firstFailureMs}`,
    `lockWaitStarted=${summary.lockWaitStarted}`,
    `lockWaitMs=${summary.lockWaitMs}`,
    `staleLockRecovered=${summary.staleLockRecovered}`,
    `eventsParsed=${summary.eventsParsed}`,
    `gateFailures=${gateFailures.length}`,
  ].join(' ');

  console.log(line);
  console.log(buildBadgeLine(output));

  for (const failure of gateFailures) {
    console.error(
      `BUILD_GATE_FAILED key=${failure.key} actual=${failure.actual} expectedMax=${failure.expectedMax}`
    );
  }
  }

  if (args.githubSummary) {
    const markdown = buildMarkdownReport(output);
    const summaryPath = publishGithubSummary(markdown);
    console.log(`BUILD_SUMMARY_GITHUB file=${summaryPath}`);
  }

  if (summary.status === 'failed' || gateFailures.length > 0) {
    process.exit(1);
  }
}

main();
