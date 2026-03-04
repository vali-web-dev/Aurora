import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { auth } from '@/lib/auth';

type SchedulerProfile = 'dev' | 'runtime' | 'ci' | 'full';

const allowedProfiles: SchedulerProfile[] = ['dev', 'runtime', 'ci', 'full'];
const schedulerRunHistoryFile = path.join(process.cwd(), 'artifacts', 'scheduler-profile-runs.json');
const schedulerIncidentAcksFile = path.join(process.cwd(), 'artifacts', 'scheduler-incident-acks.json');
const schedulerEscalationEventsFile = path.join(process.cwd(), 'artifacts', 'scheduler-escalation-events.json');
const schedulerExportManifestFile = path.join(process.cwd(), 'artifacts', 'scheduler-exports', 'manifest.json');
const schedulerExportRunsFile = path.join(process.cwd(), 'artifacts', 'scheduler-export-runs.json');
const schedulerTrendHistoryFile = path.join(process.cwd(), 'artifacts', 'scheduler-trend-history.json');

type SchedulerRunRecord = {
  id: string;
  profile: SchedulerProfile;
  ok: boolean;
  exitCode: number;
  durationMs: number;
  message: string;
  outputTail: string[];
  startedAt: string;
  finishedAt: string;
  actor: {
    userId: string;
    email: string;
  };
};

type SchedulerIncidentAck = {
  profile: SchedulerProfile;
  mutedUntil: string | null;
  acknowledgedAt: string;
  actor: {
    userId: string;
    email: string;
  };
};

type SchedulerEscalation = {
  profile: SchedulerProfile;
  severity: 'medium' | 'high';
  reasons: string[];
  suppressedByMute: boolean;
  triggeredAt: string;
};

type SchedulerEscalationEvent = {
  id: string;
  profile: SchedulerProfile;
  type: 'triggered' | 'resolved' | 'severity-changed' | 'suppression-changed' | 'acknowledged' | 'ack-cleared';
  at: string;
  actor: {
    userId: string;
    email: string;
  };
  before: SchedulerEscalation | null;
  after: SchedulerEscalation | null;
  message: string;
};

type SchedulerExportRunRecord = {
  id: string;
  ok: boolean;
  exitCode: number;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  message: string;
  outputTail: string[];
  actor: {
    userId: string;
    email: string;
  };
};

type SchedulerTrendSnapshot = {
  generatedAt: string;
  runId: string;
  profiles: Record<
    SchedulerProfile,
    {
      label: 'Improving' | 'Stable' | 'Declining' | 'No data';
      recentSuccessRate: number;
      olderSuccessRate: number;
      sampleSize: number;
    }
  >;
};

function isSchedulerProfile(value: unknown): value is SchedulerProfile {
  return typeof value === 'string' && allowedProfiles.includes(value as SchedulerProfile);
}

function createRunId(profile: SchedulerProfile) {
  return `${profile}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readSchedulerRunHistory(): SchedulerRunRecord[] {
  try {
    if (!fs.existsSync(schedulerRunHistoryFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(schedulerRunHistoryFile, 'utf-8')) as unknown;
    return Array.isArray(parsed) ? (parsed as SchedulerRunRecord[]) : [];
  } catch {
    return [];
  }
}

function appendSchedulerRunHistory(record: SchedulerRunRecord) {
  const existing = readSchedulerRunHistory();
  const next = [...existing, record].slice(-300);
  fs.mkdirSync(path.dirname(schedulerRunHistoryFile), { recursive: true });
  fs.writeFileSync(schedulerRunHistoryFile, JSON.stringify(next, null, 2), 'utf-8');
}

function readIncidentAcks(): Record<SchedulerProfile, SchedulerIncidentAck | null> {
  const defaults = Object.fromEntries(allowedProfiles.map((profile) => [profile, null])) as Record<
    SchedulerProfile,
    SchedulerIncidentAck | null
  >;

  try {
    if (!fs.existsSync(schedulerIncidentAcksFile)) return defaults;
    const parsed = JSON.parse(fs.readFileSync(schedulerIncidentAcksFile, 'utf-8')) as unknown;
    if (!parsed || typeof parsed !== 'object') return defaults;

    for (const profile of allowedProfiles) {
      const candidate = (parsed as Record<string, unknown>)[profile] as SchedulerIncidentAck | null | undefined;
      defaults[profile] = candidate ?? null;
    }

    return defaults;
  } catch {
    return defaults;
  }
}

function writeIncidentAcks(acks: Record<SchedulerProfile, SchedulerIncidentAck | null>) {
  fs.mkdirSync(path.dirname(schedulerIncidentAcksFile), { recursive: true });
  fs.writeFileSync(schedulerIncidentAcksFile, JSON.stringify(acks, null, 2), 'utf-8');
}

function createEscalationEventId(profile: SchedulerProfile) {
  return `esc-${profile}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readEscalationEvents(): SchedulerEscalationEvent[] {
  try {
    if (!fs.existsSync(schedulerEscalationEventsFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(schedulerEscalationEventsFile, 'utf-8')) as unknown;
    return Array.isArray(parsed) ? (parsed as SchedulerEscalationEvent[]) : [];
  } catch {
    return [];
  }
}

function appendEscalationEvent(event: SchedulerEscalationEvent) {
  const existing = readEscalationEvents();
  const next = [...existing, event].slice(-600);
  fs.mkdirSync(path.dirname(schedulerEscalationEventsFile), { recursive: true });
  fs.writeFileSync(schedulerEscalationEventsFile, JSON.stringify(next, null, 2), 'utf-8');
}

function readSchedulerExportManifest(): {
  generatedAt: string;
  runId: string;
  outputDir: string;
  datasets: Record<string, { file: string; count: number }>;
  profileCounts: Record<string, number>;
  trends: {
    historyCount: number;
    profileLabels: Record<string, string>;
  } | null;
  retention: {
    policyDays: number;
    retainedDayFolders: number;
    deletedDayFolders: number;
    deletedRunFolders: number;
    lastCleanupAt: string;
  } | null;
} | null {
  try {
    if (!fs.existsSync(schedulerExportManifestFile)) return null;
    const parsed = JSON.parse(fs.readFileSync(schedulerExportManifestFile, 'utf-8')) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const manifest = parsed as {
      generatedAt?: unknown;
      runId?: unknown;
      outputDir?: unknown;
      datasets?: unknown;
      profileCounts?: unknown;
      trends?: unknown;
      retention?: unknown;
    };

    if (typeof manifest.generatedAt !== 'string' || typeof manifest.runId !== 'string' || typeof manifest.outputDir !== 'string') {
      return null;
    }

    return {
      generatedAt: manifest.generatedAt,
      runId: manifest.runId,
      outputDir: manifest.outputDir,
      datasets: (manifest.datasets && typeof manifest.datasets === 'object'
        ? manifest.datasets
        : {}) as Record<string, { file: string; count: number }>,
      profileCounts: (manifest.profileCounts && typeof manifest.profileCounts === 'object'
        ? manifest.profileCounts
        : {}) as Record<string, number>,
      trends: (manifest.trends && typeof manifest.trends === 'object'
        ? manifest.trends
        : null) as {
          historyCount: number;
          profileLabels: Record<string, string>;
        } | null,
      retention: (manifest.retention && typeof manifest.retention === 'object'
        ? manifest.retention
        : null) as {
          policyDays: number;
          retainedDayFolders: number;
          deletedDayFolders: number;
          deletedRunFolders: number;
          lastCleanupAt: string;
        } | null,
    };
  } catch {
    return null;
  }
}

function readSchedulerTrendHistory(): SchedulerTrendSnapshot[] {
  try {
    if (!fs.existsSync(schedulerTrendHistoryFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(schedulerTrendHistoryFile, 'utf-8')) as unknown;
    return Array.isArray(parsed) ? (parsed as SchedulerTrendSnapshot[]) : [];
  } catch {
    return [];
  }
}

function readSchedulerExportRunHistory(): SchedulerExportRunRecord[] {
  try {
    if (!fs.existsSync(schedulerExportRunsFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(schedulerExportRunsFile, 'utf-8')) as unknown;
    return Array.isArray(parsed) ? (parsed as SchedulerExportRunRecord[]) : [];
  } catch {
    return [];
  }
}

function toMillis(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function summarizeProfiles(records: SchedulerRunRecord[], windowSize: number) {
  const summaries = Object.fromEntries(
    allowedProfiles.map((profile) => [
      profile,
      {
        profile,
        totalRuns: 0,
        windowRuns: 0,
        successRate: 0,
        averageDurationMs: 0,
        consecutiveFailures: 0,
        lastSuccessAt: null as string | null,
        lastRun: null as SchedulerRunRecord | null,
      },
    ])
  ) as Record<
    SchedulerProfile,
    {
      profile: SchedulerProfile;
      totalRuns: number;
      windowRuns: number;
      successRate: number;
      averageDurationMs: number;
      consecutiveFailures: number;
      lastSuccessAt: string | null;
      lastRun: SchedulerRunRecord | null;
    }
  >;

  for (const profile of allowedProfiles) {
    const profileRuns = records
      .filter((item) => item.profile === profile)
      .sort((a, b) => toMillis(b.finishedAt) - toMillis(a.finishedAt));

    const windowRuns = profileRuns.slice(0, windowSize);
    const successful = windowRuns.filter((item) => item.ok).length;
    const avgDuration = windowRuns.length
      ? Math.round(windowRuns.reduce((sum, item) => sum + Math.max(0, item.durationMs || 0), 0) / windowRuns.length)
      : 0;
    const recentFailures = profileRuns.findIndex((item) => item.ok);
    const consecutiveFailures = recentFailures === -1 ? profileRuns.length : recentFailures;
    const lastSuccess = profileRuns.find((item) => item.ok) ?? null;

    summaries[profile] = {
      profile,
      totalRuns: profileRuns.length,
      windowRuns: windowRuns.length,
      successRate: windowRuns.length ? Number(((successful / windowRuns.length) * 100).toFixed(1)) : 0,
      averageDurationMs: avgDuration,
      consecutiveFailures,
      lastSuccessAt: lastSuccess?.finishedAt ?? null,
      lastRun: profileRuns[0] ?? null,
    };
  }

  return summaries;
}

function getEscalationPolicy() {
  const failureStreakThreshold = Number(process.env.AURORA_SCHEDULER_ESCALATION_STREAK ?? '3');
  const successRateThreshold = Number(process.env.AURORA_SCHEDULER_ESCALATION_SUCCESS_RATE ?? '60');
  const minWindowRuns = Number(process.env.AURORA_SCHEDULER_ESCALATION_MIN_RUNS ?? '5');

  return {
    failureStreakThreshold: Number.isFinite(failureStreakThreshold)
      ? Math.min(Math.max(Math.round(failureStreakThreshold), 1), 20)
      : 3,
    successRateThreshold: Number.isFinite(successRateThreshold)
      ? Math.min(Math.max(successRateThreshold, 1), 100)
      : 60,
    minWindowRuns: Number.isFinite(minWindowRuns)
      ? Math.min(Math.max(Math.round(minWindowRuns), 1), 100)
      : 5,
  };
}

function buildIncidentStatus(incidentAcks: Record<SchedulerProfile, SchedulerIncidentAck | null>) {
  return Object.fromEntries(
    allowedProfiles.map((name) => {
      const ack = incidentAcks[name];
      const mutedUntilMs = ack?.mutedUntil ? toMillis(ack.mutedUntil) : 0;
      const isMuted = mutedUntilMs > Date.now();

      return [
        name,
        {
          acknowledged: Boolean(ack),
          isMuted,
          mutedUntil: ack?.mutedUntil ?? null,
          acknowledgedAt: ack?.acknowledgedAt ?? null,
          actor: ack?.actor ?? null,
        },
      ];
    })
  ) as Record<
    SchedulerProfile,
    {
      acknowledged: boolean;
      isMuted: boolean;
      mutedUntil: string | null;
      acknowledgedAt: string | null;
      actor: { userId: string; email: string } | null;
    }
  >;
}

function computeEscalations(
  summaries: ReturnType<typeof summarizeProfiles>,
  incidentStatus: ReturnType<typeof buildIncidentStatus>,
  escalationPolicy: ReturnType<typeof getEscalationPolicy>,
) {
  return Object.fromEntries(
    allowedProfiles.map((name) => {
      const summary = summaries[name];
      const reasons: string[] = [];

      if (summary.consecutiveFailures >= escalationPolicy.failureStreakThreshold) {
        reasons.push(`failure-streak:${summary.consecutiveFailures}`);
      }

      if (
        summary.windowRuns >= escalationPolicy.minWindowRuns
        && summary.successRate <= escalationPolicy.successRateThreshold
      ) {
        reasons.push(`success-rate:${summary.successRate}`);
      }

      if (reasons.length === 0) {
        return [name, null];
      }

      const severity: SchedulerEscalation['severity'] = summary.consecutiveFailures >= escalationPolicy.failureStreakThreshold + 1
        ? 'high'
        : 'medium';

      return [
        name,
        {
          profile: name,
          severity,
          reasons,
          suppressedByMute: incidentStatus[name].isMuted,
          triggeredAt: new Date().toISOString(),
        } satisfies SchedulerEscalation,
      ];
    })
  ) as Record<SchedulerProfile, SchedulerEscalation | null>;
}

function emitEscalationTransitionEvent(params: {
  profile: SchedulerProfile;
  before: SchedulerEscalation | null;
  after: SchedulerEscalation | null;
  actor: { userId: string; email: string };
}) {
  const { profile, before, after, actor } = params;

  let type: SchedulerEscalationEvent['type'] | null = null;
  let message = '';

  if (!before && after) {
    type = 'triggered';
    message = `Escalation triggered (${after.severity})`;
  } else if (before && !after) {
    type = 'resolved';
    message = `Escalation resolved`;
  } else if (before && after && before.severity !== after.severity) {
    type = 'severity-changed';
    message = `Escalation severity changed ${before.severity} → ${after.severity}`;
  } else if (before && after && before.suppressedByMute !== after.suppressedByMute) {
    type = 'suppression-changed';
    message = after.suppressedByMute ? 'Escalation muted by acknowledgment' : 'Escalation unmuted';
  }

  if (!type) return;

  appendEscalationEvent({
    id: createEscalationEventId(profile),
    profile,
    type,
    at: new Date().toISOString(),
    actor,
    before,
    after,
    message,
  });
}

function csvEscape(value: unknown) {
  const text = value == null ? '' : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv<T extends Record<string, unknown>>(rows: T[], columns: Array<keyof T>) {
  const header = columns.map((column) => csvEscape(String(column))).join(',');
  const body = rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')).join('\n');
  return `${header}\n${body}`;
}

function getAdminAllowlist(): string[] {
  const multi = (process.env.AURORA_ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const singleCandidates = [process.env.AURORA_ADMIN_EMAIL, process.env.ADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);
  const defaults = process.env.NODE_ENV === 'development' ? ['aurora@example.com'] : [];

  return Array.from(new Set([...multi, ...singleCandidates, ...defaults]));
}

async function requireAdminUser() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!session?.user?.id || !email) {
    return { ok: false as const, status: 401, message: 'Unauthorized' };
  }

  const allowlist = getAdminAllowlist();
  if (!allowlist.includes(email)) {
    return { ok: false as const, status: 403, message: 'Forbidden: admin access required' };
  }

  return { ok: true as const, userId: session.user.id, email };
}

function runSchedulerOnce(profile: SchedulerProfile): Promise<{ exitCode: number; outputTail: string[] }> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'diagnostics-scheduler.js');
    const args = [scriptPath, '--config', 'artifacts/diagnostics-schedule.json', '--profile', profile, '--once'];

    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
    });

    let output = '';
    const timeout = setTimeout(() => {
      output += '\n[SCHEDULER] Timeout reached; process terminated.';
      child.kill('SIGTERM');
    }, 8 * 60 * 1000);

    child.stdout.on('data', (chunk) => {
      output += String(chunk);
    });

    child.stderr.on('data', (chunk) => {
      output += String(chunk);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      const lines = output
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

      resolve({
        exitCode: code ?? 1,
        outputTail: lines.slice(-80),
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        exitCode: 1,
        outputTail: [`Failed to start scheduler: ${error.message}`],
      });
    });
  });
}

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 40;
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 40;
  const profileParam = request.nextUrl.searchParams.get('profile');
  const profile = isSchedulerProfile(profileParam) ? profileParam : null;
  const summaryWindowParam = request.nextUrl.searchParams.get('summaryWindow');
  const summaryWindow = summaryWindowParam ? Number(summaryWindowParam) : 20;
  const safeSummaryWindow = Number.isFinite(summaryWindow)
    ? Math.min(Math.max(summaryWindow, 1), 100)
    : 20;
  const formatParam = (request.nextUrl.searchParams.get('format') || '').toLowerCase();
  const exportDatasetParam = (request.nextUrl.searchParams.get('dataset') || 'events').toLowerCase();
  const exportFormat = formatParam === 'csv' || formatParam === 'json' ? formatParam : null;
  const exportDataset = exportDatasetParam === 'runs' || exportDatasetParam === 'summaries' || exportDatasetParam === 'events'
    ? exportDatasetParam
    : 'events';
  const escalationPolicy = getEscalationPolicy();

  const all = readSchedulerRunHistory();
  const filtered = profile ? all.filter((item) => item.profile === profile) : all;
  const sortedFiltered = filtered.sort((a, b) => toMillis(b.finishedAt) - toMillis(a.finishedAt));
  const items = sortedFiltered.slice(0, safeLimit);
  const summaries = summarizeProfiles(all, safeSummaryWindow);
  const incidentAcks = readIncidentAcks();
  const incidentStatus = buildIncidentStatus(incidentAcks);
  const totalRuns = all.length;
  const totalSuccesses = all.filter((item) => item.ok).length;
  const globalSuccessRate = totalRuns ? Number(((totalSuccesses / totalRuns) * 100).toFixed(1)) : 0;
  const activeIncidentProfiles = allowedProfiles.filter((name) => {
    const summary = summaries[name];
    return summary.consecutiveFailures >= 2;
  });
  const mutedIncidentProfiles = activeIncidentProfiles.filter((name) => incidentStatus[name].isMuted);
  const activeUnmutedIncidentProfiles = activeIncidentProfiles.filter((name) => !incidentStatus[name].isMuted);

  const escalations = computeEscalations(summaries, incidentStatus, escalationPolicy);

  const escalatedProfiles = allowedProfiles.filter((name) => Boolean(escalations[name]));
  const escalatedUnmutedProfiles = escalatedProfiles.filter((name) => !escalations[name]?.suppressedByMute);
  const webhookConfigured = Boolean(process.env.PLATFORM_DIAG_WEBHOOK_URL || process.env.AURORA_DIAG_WEBHOOK_URL);
  const emailConfigured = Boolean(process.env.AURORA_ALERT_EMAILS || process.env.ALERT_EMAIL_TO);
  const escalationEvents = readEscalationEvents()
    .sort((a, b) => toMillis(b.at) - toMillis(a.at))
    .slice(0, 60);
  const exportManifest = readSchedulerExportManifest();
  const trendHistory = readSchedulerTrendHistory().sort((a, b) => toMillis(b.generatedAt) - toMillis(a.generatedAt));
  const latestTrend = trendHistory[0] ?? null;
  const previousTrend = trendHistory[1] ?? null;
  const exportRuns = readSchedulerExportRunHistory()
    .sort((a, b) => toMillis(b.finishedAt) - toMillis(a.finishedAt))
    .slice(0, 8);

  if (exportFormat) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (exportDataset === 'events') {
      const rows = escalationEvents.map((event) => ({
        id: event.id,
        profile: event.profile,
        type: event.type,
        at: event.at,
        actorEmail: event.actor.email,
        message: event.message,
        severityBefore: event.before?.severity ?? '',
        severityAfter: event.after?.severity ?? '',
        reasonsAfter: event.after?.reasons.join('|') ?? '',
        suppressedAfter: event.after?.suppressedByMute ?? '',
      }));

      if (exportFormat === 'csv') {
        const csv = toCsv(rows, [
          'id',
          'profile',
          'type',
          'at',
          'actorEmail',
          'message',
          'severityBefore',
          'severityAfter',
          'reasonsAfter',
          'suppressedAfter',
        ]);
        return new NextResponse(csv, {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="scheduler-events-${timestamp}.csv"`,
          },
        });
      }

      return NextResponse.json({ dataset: 'events', generatedAt: new Date().toISOString(), items: rows });
    }

    if (exportDataset === 'runs') {
      const rows = sortedFiltered.map((item) => ({
        id: item.id,
        profile: item.profile,
        ok: item.ok,
        exitCode: item.exitCode,
        durationMs: item.durationMs,
        startedAt: item.startedAt,
        finishedAt: item.finishedAt,
        actorEmail: item.actor.email,
        message: item.message,
      }));

      if (exportFormat === 'csv') {
        const csv = toCsv(rows, [
          'id',
          'profile',
          'ok',
          'exitCode',
          'durationMs',
          'startedAt',
          'finishedAt',
          'actorEmail',
          'message',
        ]);
        return new NextResponse(csv, {
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="scheduler-runs-${timestamp}.csv"`,
          },
        });
      }

      return NextResponse.json({ dataset: 'runs', generatedAt: new Date().toISOString(), items: rows });
    }

    const summaryRows = allowedProfiles.map((name) => ({
      profile: name,
      totalRuns: summaries[name].totalRuns,
      windowRuns: summaries[name].windowRuns,
      successRate: summaries[name].successRate,
      averageDurationMs: summaries[name].averageDurationMs,
      consecutiveFailures: summaries[name].consecutiveFailures,
      lastSuccessAt: summaries[name].lastSuccessAt ?? '',
      escalated: Boolean(escalations[name]),
      escalationSeverity: escalations[name]?.severity ?? '',
      muted: incidentStatus[name].isMuted,
    }));

    if (exportFormat === 'csv') {
      const csv = toCsv(summaryRows, [
        'profile',
        'totalRuns',
        'windowRuns',
        'successRate',
        'averageDurationMs',
        'consecutiveFailures',
        'lastSuccessAt',
        'escalated',
        'escalationSeverity',
        'muted',
      ]);
      return new NextResponse(csv, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="scheduler-summaries-${timestamp}.csv"`,
        },
      });
    }

    return NextResponse.json({ dataset: 'summaries', generatedAt: new Date().toISOString(), items: summaryRows });
  }

  const recentByProfile = Object.fromEntries(
    allowedProfiles.map((name) => [
      name,
      all
        .filter((item) => item.profile === name)
        .sort((a, b) => toMillis(b.finishedAt) - toMillis(a.finishedAt))
        .slice(0, 5),
    ])
  ) as Record<SchedulerProfile, SchedulerRunRecord[]>;

  return NextResponse.json({
    items,
    total: filtered.length,
    profile,
    summaryWindow: safeSummaryWindow,
    summaries,
    globalSummary: {
      totalRuns,
      totalSuccesses,
      globalSuccessRate,
      activeIncidentProfiles,
      activeUnmutedIncidentProfiles,
      mutedIncidentProfiles,
      escalatedProfiles,
      escalatedUnmutedProfiles,
      notificationTargets: {
        webhookConfigured,
        emailConfigured,
      },
    },
    escalationPolicy,
    escalations,
    escalationEvents,
    exports: {
      lastGeneratedAt: exportManifest?.generatedAt ?? null,
      runId: exportManifest?.runId ?? null,
      outputDir: exportManifest?.outputDir ?? null,
      datasets: exportManifest?.datasets ?? {},
      profileCounts: exportManifest?.profileCounts ?? {},
      trends: {
        historyCount: exportManifest?.trends?.historyCount ?? trendHistory.length,
        profileLabels: exportManifest?.trends?.profileLabels ?? {},
        latest: latestTrend,
        previous: previousTrend,
      },
      retention: exportManifest?.retention ?? null,
      manualRuns: exportRuns,
    },
    incidentStatus,
    recentByProfile,
    generatedAt: new Date().toISOString(),
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminUser();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });
    }

    const body = await request.json() as {
      profile?: unknown;
      muteMinutes?: unknown;
      clear?: unknown;
    };

    if (!isSchedulerProfile(body.profile)) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 });
    }

    const incidentAcks = readIncidentAcks();
    const previousIncidentAcks = JSON.parse(JSON.stringify(incidentAcks)) as Record<SchedulerProfile, SchedulerIncidentAck | null>;
    const shouldClear = body.clear === true;

    if (shouldClear) {
      incidentAcks[body.profile] = null;
      writeIncidentAcks(incidentAcks);

      appendEscalationEvent({
        id: createEscalationEventId(body.profile),
        profile: body.profile,
        type: 'ack-cleared',
        at: new Date().toISOString(),
        actor: {
          userId: adminCheck.userId,
          email: adminCheck.email,
        },
        before: null,
        after: null,
        message: 'Incident acknowledgment cleared',
      });

      const allRuns = readSchedulerRunHistory();
      const policy = getEscalationPolicy();
      const beforeStatus = buildIncidentStatus(previousIncidentAcks);
      const beforeEscalations = computeEscalations(summarizeProfiles(allRuns, 20), beforeStatus, policy);
      const afterStatus = buildIncidentStatus(incidentAcks);
      const afterEscalations = computeEscalations(summarizeProfiles(allRuns, 20), afterStatus, policy);
      emitEscalationTransitionEvent({
        profile: body.profile,
        before: beforeEscalations[body.profile],
        after: afterEscalations[body.profile],
        actor: {
          userId: adminCheck.userId,
          email: adminCheck.email,
        },
      });

      return NextResponse.json({ profile: body.profile, cleared: true });
    }

    const rawMuteMinutes = typeof body.muteMinutes === 'number' ? body.muteMinutes : 0;
    const muteMinutes = Number.isFinite(rawMuteMinutes) ? Math.round(rawMuteMinutes) : 0;
    const safeMuteMinutes = Math.min(Math.max(muteMinutes, 0), 24 * 60);

    const ack: SchedulerIncidentAck = {
      profile: body.profile,
      mutedUntil: safeMuteMinutes > 0
        ? new Date(Date.now() + safeMuteMinutes * 60 * 1000).toISOString()
        : null,
      acknowledgedAt: new Date().toISOString(),
      actor: {
        userId: adminCheck.userId,
        email: adminCheck.email,
      },
    };

    incidentAcks[body.profile] = ack;
    writeIncidentAcks(incidentAcks);

    appendEscalationEvent({
      id: createEscalationEventId(body.profile),
      profile: body.profile,
      type: 'acknowledged',
      at: new Date().toISOString(),
      actor: {
        userId: adminCheck.userId,
        email: adminCheck.email,
      },
      before: null,
      after: null,
      message: safeMuteMinutes > 0 ? `Incident acknowledgment muted for ${safeMuteMinutes}m` : 'Incident acknowledged',
    });

    const allRuns = readSchedulerRunHistory();
    const policy = getEscalationPolicy();
    const beforeStatus = buildIncidentStatus(previousIncidentAcks);
    const beforeEscalations = computeEscalations(summarizeProfiles(allRuns, 20), beforeStatus, policy);
    const afterStatus = buildIncidentStatus(incidentAcks);
    const afterEscalations = computeEscalations(summarizeProfiles(allRuns, 20), afterStatus, policy);
    emitEscalationTransitionEvent({
      profile: body.profile,
      before: beforeEscalations[body.profile],
      after: afterEscalations[body.profile],
      actor: {
        userId: adminCheck.userId,
        email: adminCheck.email,
      },
    });

    return NextResponse.json({
      profile: body.profile,
      cleared: false,
      ack,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminUser();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });
    }

    const body = await request.json() as { profile?: unknown };

    if (!isSchedulerProfile(body.profile)) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 });
    }

    const startedAt = new Date().toISOString();
    const allBefore = readSchedulerRunHistory();
    const policy = getEscalationPolicy();
    const incidentAcksBefore = readIncidentAcks();
    const escalationBefore = computeEscalations(
      summarizeProfiles(allBefore, 20),
      buildIncidentStatus(incidentAcksBefore),
      policy,
    );

    const result = await runSchedulerOnce(body.profile);
    const finishedAt = new Date().toISOString();
    const durationMs = Math.max(0, toMillis(finishedAt) - toMillis(startedAt));

    const record: SchedulerRunRecord = {
      id: createRunId(body.profile),
      profile: body.profile,
      ok: result.exitCode === 0,
      exitCode: result.exitCode,
      durationMs,
      message: result.exitCode === 0
        ? `Scheduler profile '${body.profile}' completed successfully.`
        : `Scheduler profile '${body.profile}' completed with failures (exit ${result.exitCode}).`,
      outputTail: result.outputTail,
      startedAt,
      finishedAt,
      actor: {
        userId: adminCheck.userId,
        email: adminCheck.email,
      },
    };

    appendSchedulerRunHistory(record);

    const allAfter = readSchedulerRunHistory();
    const incidentAcksAfter = readIncidentAcks();
    const escalationAfter = computeEscalations(
      summarizeProfiles(allAfter, 20),
      buildIncidentStatus(incidentAcksAfter),
      policy,
    );

    emitEscalationTransitionEvent({
      profile: body.profile,
      before: escalationBefore[body.profile],
      after: escalationAfter[body.profile],
      actor: {
        userId: adminCheck.userId,
        email: adminCheck.email,
      },
    });

    return NextResponse.json({
      ...record,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
