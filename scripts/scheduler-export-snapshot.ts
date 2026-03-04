import fs from 'fs';
import path from 'path';

type SchedulerProfile = 'dev' | 'runtime' | 'ci' | 'full';
const SCHEDULER_PROFILES: SchedulerProfile[] = ['dev', 'runtime', 'ci', 'full'];

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

type SchedulerEscalationEvent = {
  id: string;
  profile: SchedulerProfile;
  type: 'triggered' | 'resolved' | 'severity-changed' | 'suppression-changed' | 'acknowledged' | 'ack-cleared';
  at: string;
  actor: {
    userId: string;
    email: string;
  };
  before: {
    severity: 'medium' | 'high';
    reasons: string[];
    suppressedByMute: boolean;
    triggeredAt: string;
  } | null;
  after: {
    severity: 'medium' | 'high';
    reasons: string[];
    suppressedByMute: boolean;
    triggeredAt: string;
  } | null;
  message: string;
};

type SchedulerExportManifest = {
  generatedAt: string;
  runId: string;
  outputDir: string;
  datasets: {
    runs: { file: string; count: number };
    events: { file: string; count: number };
    profiles: { file: string; count: number };
    trends: { file: string; count: number };
  };
  profileCounts: Record<SchedulerProfile, number>;
  trends: {
    historyCount: number;
    profileLabels: Record<SchedulerProfile, 'Improving' | 'Stable' | 'Declining' | 'No data'>;
  };
  retention: {
    policyDays: number;
    retainedDayFolders: number;
    deletedDayFolders: number;
    deletedRunFolders: number;
    lastCleanupAt: string;
  };
};

const root = process.cwd();
const artifactsDir = path.join(root, 'artifacts');
const exportsRoot = path.join(artifactsDir, 'scheduler-exports');
const runHistoryPath = path.join(artifactsDir, 'scheduler-profile-runs.json');
const escalationEventsPath = path.join(artifactsDir, 'scheduler-escalation-events.json');
const trendHistoryPath = path.join(artifactsDir, 'scheduler-trend-history.json');
const manifestPath = path.join(exportsRoot, 'manifest.json');

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

function toPosixRelative(filePath: string) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function computeSuccessRate<T extends { ok: boolean }>(items: T[]) {
  if (items.length === 0) return 0;
  return Number((items.filter((item) => item.ok).length / items.length).toFixed(3));
}

function deriveTrendLabel(recentSuccessRate: number, previousSuccessRate: number): 'Improving' | 'Stable' | 'Declining' | 'No data' {
  if (recentSuccessRate > previousSuccessRate + 0.2) return 'Improving';
  if (recentSuccessRate + 0.2 < previousSuccessRate) return 'Declining';
  return 'Stable';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isSchedulerProfile(value: unknown): value is SchedulerProfile {
  return value === 'dev' || value === 'runtime' || value === 'ci' || value === 'full';
}

function isSchedulerRunRecord(value: unknown): value is SchedulerRunRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SchedulerRunRecord>;

  return (
    typeof candidate.id === 'string' &&
    isSchedulerProfile(candidate.profile) &&
    typeof candidate.ok === 'boolean' &&
    isFiniteNumber(candidate.exitCode) &&
    isFiniteNumber(candidate.durationMs) &&
    typeof candidate.message === 'string' &&
    isStringArray(candidate.outputTail) &&
    isValidDateString(candidate.startedAt) &&
    isValidDateString(candidate.finishedAt) &&
    typeof candidate.actor?.userId === 'string' &&
    typeof candidate.actor?.email === 'string'
  );
}

function sanitizeRuns(input: unknown): SchedulerRunRecord[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isSchedulerRunRecord);
}

function isSchedulerEscalationEventType(value: unknown): value is SchedulerEscalationEvent['type'] {
  return value === 'triggered'
    || value === 'resolved'
    || value === 'severity-changed'
    || value === 'suppression-changed'
    || value === 'acknowledged'
    || value === 'ack-cleared';
}

function isSchedulerEscalationState(value: unknown): value is SchedulerEscalationEvent['before'] {
  if (value === null) return true;
  if (!value || typeof value !== 'object') return false;
  const candidate = value as {
    severity?: unknown;
    reasons?: unknown;
    suppressedByMute?: unknown;
    triggeredAt?: unknown;
  };

  return (
    (candidate.severity === 'medium' || candidate.severity === 'high') &&
    isStringArray(candidate.reasons) &&
    typeof candidate.suppressedByMute === 'boolean' &&
    isValidDateString(candidate.triggeredAt)
  );
}

function isSchedulerEscalationEvent(value: unknown): value is SchedulerEscalationEvent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SchedulerEscalationEvent>;

  return (
    typeof candidate.id === 'string' &&
    isSchedulerProfile(candidate.profile) &&
    isSchedulerEscalationEventType(candidate.type) &&
    isValidDateString(candidate.at) &&
    typeof candidate.actor?.userId === 'string' &&
    typeof candidate.actor?.email === 'string' &&
    isSchedulerEscalationState(candidate.before) &&
    isSchedulerEscalationState(candidate.after) &&
    typeof candidate.message === 'string'
  );
}

function sanitizeEscalationEvents(input: unknown): SchedulerEscalationEvent[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isSchedulerEscalationEvent);
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function asIsoDay(input: Date) {
  const y = input.getUTCFullYear();
  const m = String(input.getUTCMonth() + 1).padStart(2, '0');
  const d = String(input.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function isIsoDayFolder(name: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(name);
}

function cleanupOldExports(baseDir: string, retentionDays: number, now: Date) {
  if (!fs.existsSync(baseDir)) {
    return {
      retainedDayFolders: 0,
      deletedDayFolders: 0,
      deletedRunFolders: 0,
    };
  }

  const cutoffMs = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
  let retainedDayFolders = 0;
  let deletedDayFolders = 0;
  let deletedRunFolders = 0;

  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!isIsoDayFolder(entry.name)) continue;

    const dayDateMs = Date.parse(`${entry.name}T00:00:00.000Z`);
    if (!Number.isFinite(dayDateMs)) continue;

    const dayPath = path.join(baseDir, entry.name);
    if (dayDateMs < cutoffMs) {
      try {
        const runDirs = fs.readdirSync(dayPath, { withFileTypes: true }).filter((item) => item.isDirectory()).length;
        deletedRunFolders += runDirs;
      } catch {
        // best-effort cleanup accounting
      }

      fs.rmSync(dayPath, { recursive: true, force: true });
      deletedDayFolders += 1;
    } else {
      retainedDayFolders += 1;
    }
  }

  return {
    retainedDayFolders,
    deletedDayFolders,
    deletedRunFolders,
  };
}

function profileCounts(runs: SchedulerRunRecord[]): Record<SchedulerProfile, number> {
  const counts = Object.fromEntries(SCHEDULER_PROFILES.map((profile) => [profile, 0])) as Record<SchedulerProfile, number>;

  for (const run of runs) {
    counts[run.profile] += 1;
  }

  return counts;
}

function profileSummary(runs: SchedulerRunRecord[]) {
  const counts = profileCounts(runs);

  return SCHEDULER_PROFILES.map((profile) => {
    const profileRuns = runs
      .filter((run) => run.profile === profile)
      .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt));

    const lastTwenty = profileRuns.slice(0, 20);
    const success = lastTwenty.filter((run) => run.ok).length;
    const successRate = lastTwenty.length ? Number(((success / lastTwenty.length) * 100).toFixed(1)) : 0;

    return {
      profile,
      totalRuns: counts[profile],
      sampledRuns: lastTwenty.length,
      successRate,
      lastRunAt: profileRuns[0]?.finishedAt ?? null,
      lastExitCode: profileRuns[0]?.exitCode ?? null,
    };
  });
}

function computeTrendSnapshot(runs: SchedulerRunRecord[], generatedAt: string, runId: string): SchedulerTrendSnapshot {
  const result = Object.fromEntries(
    SCHEDULER_PROFILES.map((profile) => {
      const profileRuns = runs
        .filter((run) => run.profile === profile)
        .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt))
        .slice(0, 8);

      if (profileRuns.length === 0) {
        return [
          profile,
          {
            label: 'No data' as const,
            recentSuccessRate: 0,
            olderSuccessRate: 0,
            sampleSize: 0,
          },
        ];
      }

      const recentWindow = profileRuns.slice(0, Math.min(3, profileRuns.length));
      const previousWindow = profileRuns.slice(Math.min(3, profileRuns.length));

      const recentSuccessRate = computeSuccessRate(recentWindow);
      const previousSuccessRate = previousWindow.length
        ? computeSuccessRate(previousWindow)
        : recentSuccessRate;
      const label = deriveTrendLabel(recentSuccessRate, previousSuccessRate);

      return [
        profile,
        {
          label,
          recentSuccessRate,
          olderSuccessRate: previousSuccessRate,
          sampleSize: profileRuns.length,
        },
      ];
    })
  ) as SchedulerTrendSnapshot['profiles'];

  return {
    generatedAt,
    runId,
    profiles: result,
  };
}

function appendTrendHistory(snapshot: SchedulerTrendSnapshot) {
  const existing = readJson<SchedulerTrendSnapshot[]>(trendHistoryPath, []);
  const next = [...existing, snapshot].slice(-365);
  writeJson(trendHistoryPath, next);
  return next.length;
}

function main() {
  const now = new Date();
  const generatedAt = now.toISOString();
  const runId = `exp-${Date.now().toString(36)}`;
  const dayDir = asIsoDay(now);
  const retentionRaw = Number(process.env.AURORA_SCHEDULER_EXPORT_RETENTION_DAYS ?? '14');
  const retentionDays = Number.isFinite(retentionRaw)
    ? Math.min(Math.max(Math.round(retentionRaw), 1), 365)
    : 14;

  const cleanup = cleanupOldExports(exportsRoot, retentionDays, now);

  const rawRuns = readJson<unknown>(runHistoryPath, []);
  const runs = sanitizeRuns(rawRuns);
  const rawRunCount = Array.isArray(rawRuns) ? rawRuns.length : 0;
  const droppedRunCount = Math.max(rawRunCount - runs.length, 0);

  const rawEvents = readJson<unknown>(escalationEventsPath, []);
  const events = sanitizeEscalationEvents(rawEvents);
  const rawEventCount = Array.isArray(rawEvents) ? rawEvents.length : 0;
  const droppedEventCount = Math.max(rawEventCount - events.length, 0);
  const profiles = profileSummary(runs);
  const trendSnapshot = computeTrendSnapshot(runs, generatedAt, runId);

  const outputDir = path.join(exportsRoot, dayDir, runId);
  const runsFile = path.join(outputDir, 'runs.json');
  const eventsFile = path.join(outputDir, 'events.json');
  const profilesFile = path.join(outputDir, 'profiles.json');
  const trendsFile = path.join(outputDir, 'trends.json');

  writeJson(runsFile, runs);
  writeJson(eventsFile, events);
  writeJson(profilesFile, profiles);
  writeJson(trendsFile, trendSnapshot);
  const trendHistoryCount = appendTrendHistory(trendSnapshot);

  const manifest: SchedulerExportManifest = {
    generatedAt,
    runId,
    outputDir: toPosixRelative(outputDir),
    datasets: {
      runs: { file: toPosixRelative(runsFile), count: runs.length },
      events: { file: toPosixRelative(eventsFile), count: events.length },
      profiles: { file: toPosixRelative(profilesFile), count: profiles.length },
      trends: { file: toPosixRelative(trendsFile), count: Object.keys(trendSnapshot.profiles).length },
    },
    profileCounts: profileCounts(runs),
    trends: {
      historyCount: trendHistoryCount,
      profileLabels: {
        dev: trendSnapshot.profiles.dev.label,
        runtime: trendSnapshot.profiles.runtime.label,
        ci: trendSnapshot.profiles.ci.label,
        full: trendSnapshot.profiles.full.label,
      },
    },
    retention: {
      policyDays: retentionDays,
      retainedDayFolders: cleanup.retainedDayFolders,
      deletedDayFolders: cleanup.deletedDayFolders,
      deletedRunFolders: cleanup.deletedRunFolders,
      lastCleanupAt: generatedAt,
    },
  };

  writeJson(manifestPath, manifest);

  console.log(`Scheduler export snapshot written: ${manifest.outputDir}`);
  console.log(`Datasets: runs=${manifest.datasets.runs.count}, events=${manifest.datasets.events.count}, profiles=${manifest.datasets.profiles.count}, trends=${manifest.datasets.trends.count}`);
  console.log(`Sanitization: droppedRuns=${droppedRunCount}, droppedEvents=${droppedEventCount}`);
  if (droppedRunCount > 0 || droppedEventCount > 0) {
    console.log(`Sanitization warning: ignored malformed records (runs=${droppedRunCount}, events=${droppedEventCount})`);
  }
  console.log(`Retention: keep=${manifest.retention.policyDays}d, retainedDays=${manifest.retention.retainedDayFolders}, deletedDays=${manifest.retention.deletedDayFolders}, deletedRuns=${manifest.retention.deletedRunFolders}`);
  console.log(`Trend labels: dev=${manifest.trends.profileLabels.dev}, runtime=${manifest.trends.profileLabels.runtime}, ci=${manifest.trends.profileLabels.ci}, full=${manifest.trends.profileLabels.full}`);
}

main();
