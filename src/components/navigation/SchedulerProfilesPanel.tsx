'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/aurora/Badge';

export type SchedulerProfileItem = {
  profile: 'dev' | 'runtime' | 'ci' | 'full';
  command: string;
  jobs: string[];
  description: string;
};

type RunStatus = {
  running: boolean;
  ok: boolean | null;
  message: string;
  output: string[];
};

type SchedulerRunRecord = {
  id: string;
  profile: SchedulerProfileItem['profile'];
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

type SchedulerProfileSummary = {
  profile: SchedulerProfileItem['profile'];
  totalRuns: number;
  windowRuns: number;
  successRate: number;
  averageDurationMs: number;
  consecutiveFailures: number;
  lastSuccessAt: string | null;
  lastRun: SchedulerRunRecord | null;
};

type SchedulerGlobalSummary = {
  totalRuns: number;
  totalSuccesses: number;
  globalSuccessRate: number;
  activeIncidentProfiles: SchedulerProfileItem['profile'][];
  activeUnmutedIncidentProfiles: SchedulerProfileItem['profile'][];
  mutedIncidentProfiles: SchedulerProfileItem['profile'][];
  escalatedProfiles: SchedulerProfileItem['profile'][];
  escalatedUnmutedProfiles: SchedulerProfileItem['profile'][];
  notificationTargets: {
    webhookConfigured: boolean;
    emailConfigured: boolean;
  };
};

type SchedulerEscalationPolicy = {
  failureStreakThreshold: number;
  successRateThreshold: number;
  minWindowRuns: number;
};

type SchedulerEscalation = {
  profile: SchedulerProfileItem['profile'];
  severity: 'medium' | 'high';
  reasons: string[];
  suppressedByMute: boolean;
  triggeredAt: string;
};

type SchedulerEscalationEvent = {
  id: string;
  profile: SchedulerProfileItem['profile'];
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

type SchedulerExportStatus = {
  lastGeneratedAt: string | null;
  runId: string | null;
  outputDir: string | null;
  datasets: Record<string, { file: string; count: number }>;
  profileCounts: Record<string, number>;
  trends: {
    historyCount: number;
    profileLabels: Record<string, string>;
    latest: {
      generatedAt: string;
      runId: string;
      profiles: Record<string, { label: string; recentSuccessRate: number; olderSuccessRate: number; sampleSize: number }>;
    } | null;
    previous: {
      generatedAt: string;
      runId: string;
      profiles: Record<string, { label: string; recentSuccessRate: number; olderSuccessRate: number; sampleSize: number }>;
    } | null;
  };
  retention: {
    policyDays: number;
    retainedDayFolders: number;
    deletedDayFolders: number;
    deletedRunFolders: number;
    lastCleanupAt: string;
  } | null;
  manualRuns: Array<{
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
  }>;
};

type SchedulerIncidentStatus = {
  acknowledged: boolean;
  isMuted: boolean;
  mutedUntil: string | null;
  acknowledgedAt: string | null;
  actor: {
    userId: string;
    email: string;
  } | null;
};

const emptyStatus: RunStatus = {
  running: false,
  ok: null,
  message: '',
  output: [],
};

const formatTrendWindowTooltip = (
  latestPercent: number,
  latestRuns: number,
  previousPercent: number,
  previousRuns: number
) => `Latest window ${latestPercent}% (${latestRuns} runs) vs previous window ${previousPercent}% (${previousRuns} runs)`;

const computeTrendWindowStats = <T extends { ok: boolean }>(runs: T[], windowSize: number) => {
  const recentWindow = runs.slice(0, Math.min(windowSize, runs.length));
  const previousWindow = runs.slice(Math.min(windowSize, runs.length));

  const recentSuccessRate = recentWindow.length
    ? recentWindow.filter((run) => run.ok).length / recentWindow.length
    : 0;
  const previousSuccessRate = previousWindow.length
    ? previousWindow.filter((run) => run.ok).length / previousWindow.length
    : recentSuccessRate;

  return {
    recentSuccessRate,
    previousSuccessRate,
    recentRunCount: recentWindow.length,
    previousRunCount: previousWindow.length,
  };
};

const deriveTrendLabel = (recentSuccessRate: number, previousSuccessRate: number): 'Improving' | 'Stable' | 'Declining' => {
  if (recentSuccessRate > previousSuccessRate + 0.2) return 'Improving';
  if (recentSuccessRate + 0.2 < previousSuccessRate) return 'Declining';
  return 'Stable';
};

const computeExportTrendDelta = (
  latestRate: number | null,
  latestRuns: number | null,
  previousRate: number | null,
  previousRuns: number | null
) => {
  const latestPercent = latestRate != null ? Number((latestRate * 100).toFixed(1)) : null;
  const previousPercent = previousRate != null ? Number((previousRate * 100).toFixed(1)) : null;

  if (latestPercent == null || previousPercent == null) {
    return {
      deltaRate: null as number | null,
      tooltip: null as string | null,
    };
  }

  return {
    deltaRate: Number((latestPercent - previousPercent).toFixed(1)),
    tooltip: formatTrendWindowTooltip(
      latestPercent,
      latestRuns ?? 0,
      previousPercent,
      previousRuns ?? 0
    ),
  };
};

export function SchedulerProfilesPanel({ profiles }: { profiles: SchedulerProfileItem[] }) {
  const [statusByProfile, setStatusByProfile] = useState<Record<string, RunStatus>>({});
  const [historyByProfile, setHistoryByProfile] = useState<Record<string, SchedulerRunRecord[]>>({});
  const [summaryByProfile, setSummaryByProfile] = useState<Record<string, SchedulerProfileSummary | null>>({});
  const [globalSummary, setGlobalSummary] = useState<SchedulerGlobalSummary | null>(null);
  const [escalationPolicy, setEscalationPolicy] = useState<SchedulerEscalationPolicy | null>(null);
  const [escalationByProfile, setEscalationByProfile] = useState<Record<string, SchedulerEscalation | null>>({});
  const [escalationEvents, setEscalationEvents] = useState<SchedulerEscalationEvent[]>([]);
  const [changeFeed, setChangeFeed] = useState<SchedulerEscalationEvent[]>([]);
  const [exportStatus, setExportStatus] = useState<SchedulerExportStatus | null>(null);
  const [incidentStatusByProfile, setIncidentStatusByProfile] = useState<Record<string, SchedulerIncidentStatus | null>>({});
  const [ackBusyByProfile, setAckBusyByProfile] = useState<Record<string, boolean>>({});
  const [exportBusy, setExportBusy] = useState<null | 'events' | 'runs' | 'summaries'>(null);
  const [exportRunBusy, setExportRunBusy] = useState(false);
  const [exportRunStatus, setExportRunStatus] = useState<null | { ok: boolean; message: string; output: string[] }>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [summaryWindow, setSummaryWindow] = useState<10 | 20 | 50>(20);
  const [exportHistoryFilter, setExportHistoryFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const knownEventIdsRef = useRef<Set<string>>(new Set());

  const runningAny = useMemo(
    () => Object.values(statusByProfile).some((status) => status.running),
    [statusByProfile]
  );

  const activeIncidents = useMemo(() => {
    return profiles
      .map((item) => {
        const summary = summaryByProfile[item.profile];
        const recentRuns = historyByProfile[item.profile] ?? [];
        if (!summary || summary.consecutiveFailures <= 0) return null;

        const failedRuns = recentRuns.filter((run) => !run.ok);
        const latestFailure = failedRuns[0] ?? recentRuns.find((run) => !run.ok) ?? null;

        return {
          profile: item.profile,
          summary,
          latestFailure,
          failedRuns: failedRuns.slice(0, 3),
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
  }, [profiles, summaryByProfile, historyByProfile]);

  const profileTrendByName = useMemo(() => {
    const result: Record<string, 'Improving' | 'Stable' | 'Declining' | 'No data'> = {};

    for (const item of profiles) {
      const runs = (historyByProfile[item.profile] ?? []).slice(0, 8);
      if (runs.length === 0) {
        result[item.profile] = 'No data';
        continue;
      }

      const stats = computeTrendWindowStats(runs, 3);
      result[item.profile] = deriveTrendLabel(stats.recentSuccessRate, stats.previousSuccessRate);
    }

    return result;
  }, [profiles, historyByProfile]);

  const profileTrendTooltipByName = useMemo(() => {
    const result: Record<string, string | null> = {};

    for (const item of profiles) {
      const runs = (historyByProfile[item.profile] ?? []).slice(0, 8);
      if (runs.length === 0) {
        result[item.profile] = null;
        continue;
      }

      const stats = computeTrendWindowStats(runs, 3);
      const recentPercent = Number((stats.recentSuccessRate * 100).toFixed(1));
      const olderPercent = Number((stats.previousSuccessRate * 100).toFixed(1));
      result[item.profile] = formatTrendWindowTooltip(
        recentPercent,
        stats.recentRunCount,
        olderPercent,
        stats.previousRunCount
      );
    }

    return result;
  }, [profiles, historyByProfile]);

  const filteredManualExportRuns = useMemo(() => {
    const runs = exportStatus?.manualRuns ?? [];
    if (exportHistoryFilter === 'all') return runs;
    if (exportHistoryFilter === 'success') return runs.filter((run) => run.ok);
    return runs.filter((run) => !run.ok);
  }, [exportStatus, exportHistoryFilter]);

  const filteredManualExportSuccessRate = useMemo(() => {
    if (filteredManualExportRuns.length === 0) return 0;
    const successCount = filteredManualExportRuns.filter((run) => run.ok).length;
    return Number(((successCount / filteredManualExportRuns.length) * 100).toFixed(1));
  }, [filteredManualExportRuns]);

  const manualExportTrend = useMemo(() => {
    const runs = filteredManualExportRuns.slice(0, 10);
    if (runs.length === 0) {
      return {
        sparkline: '—',
        label: 'No trend',
      };
    }

    const sparkline = runs
      .map((run) => (run.ok ? '●' : '○'))
      .join('');

    const stats = computeTrendWindowStats(runs, 3);
    const label = deriveTrendLabel(stats.recentSuccessRate, stats.previousSuccessRate);

    return { sparkline, label };
  }, [filteredManualExportRuns]);

  const manualExportTrendTooltip = useMemo(() => {
    const runs = filteredManualExportRuns.slice(0, 10);
    if (runs.length === 0) return null;

    const stats = computeTrendWindowStats(runs, 3);
    const recentPercent = Number((stats.recentSuccessRate * 100).toFixed(1));
    const olderPercent = Number((stats.previousSuccessRate * 100).toFixed(1));
    return formatTrendWindowTooltip(
      recentPercent,
      stats.recentRunCount,
      olderPercent,
      stats.previousRunCount
    );
  }, [filteredManualExportRuns]);

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) return `${durationMs}ms`;
    const seconds = durationMs / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remSeconds}s`;
  };

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/dev/diagnostics/scheduler/run?limit=50&summaryWindow=${summaryWindow}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json() as {
        generatedAt?: string;
        recentByProfile?: Record<SchedulerProfileItem['profile'], SchedulerRunRecord[]>;
        summaries?: Record<SchedulerProfileItem['profile'], SchedulerProfileSummary>;
        globalSummary?: SchedulerGlobalSummary;
        incidentStatus?: Record<SchedulerProfileItem['profile'], SchedulerIncidentStatus>;
        escalationPolicy?: SchedulerEscalationPolicy;
        escalations?: Record<SchedulerProfileItem['profile'], SchedulerEscalation | null>;
        escalationEvents?: SchedulerEscalationEvent[];
        exports?: SchedulerExportStatus;
      };
      const nextHistory: Record<string, SchedulerRunRecord[]> = {};
      const nextSummary: Record<string, SchedulerProfileSummary | null> = {};
      const nextIncidentStatus: Record<string, SchedulerIncidentStatus | null> = {};
      const nextEscalations: Record<string, SchedulerEscalation | null> = {};
      for (const item of profiles) {
        nextHistory[item.profile] = payload.recentByProfile?.[item.profile] ?? [];
        nextSummary[item.profile] = payload.summaries?.[item.profile] ?? null;
        nextIncidentStatus[item.profile] = payload.incidentStatus?.[item.profile] ?? null;
        nextEscalations[item.profile] = payload.escalations?.[item.profile] ?? null;
      }
      setHistoryByProfile(nextHistory);
      setSummaryByProfile(nextSummary);
      setGlobalSummary(payload.globalSummary ?? null);
      setIncidentStatusByProfile(nextIncidentStatus);
      setEscalationPolicy(payload.escalationPolicy ?? null);
      setEscalationByProfile(nextEscalations);
      setExportStatus(payload.exports ?? null);
      const nextEvents = payload.escalationEvents ?? [];
      setEscalationEvents(nextEvents);
      if (knownEventIdsRef.current.size === 0) {
        knownEventIdsRef.current = new Set(nextEvents.map((event) => event.id));
      } else {
        const unseen = nextEvents.filter((event) => !knownEventIdsRef.current.has(event.id));
        if (unseen.length > 0) {
          setChangeFeed((current) => [...unseen, ...current].slice(0, 12));
          for (const event of unseen) {
            knownEventIdsRef.current.add(event.id);
          }
        }
      }
      setLastUpdatedAt(payload.generatedAt ?? new Date().toISOString());
    } catch {
      // Keep panel functional even when history endpoint cannot be read.
    }
  }, [profiles, summaryWindow]);

  const acknowledgeIncident = async (profile: SchedulerProfileItem['profile'], action: 'mute30' | 'clear') => {
    setAckBusyByProfile((current) => ({
      ...current,
      [profile]: true,
    }));

    try {
      const body = action === 'clear'
        ? { profile, clear: true }
        : { profile, muteMinutes: 30 };

      await fetch('/api/dev/diagnostics/scheduler/run', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await loadHistory();
    } catch {
      // Ignore and keep panel responsive.
    } finally {
      setAckBusyByProfile((current) => ({
        ...current,
        [profile]: false,
      }));
    }
  };

  const downloadExport = async (dataset: 'events' | 'runs' | 'summaries') => {
    setExportBusy(dataset);
    try {
      const response = await fetch(`/api/dev/diagnostics/scheduler/run?format=csv&dataset=${dataset}&limit=300`, {
        cache: 'no-store',
      });
      if (!response.ok) return;

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
      const fileName = fileNameMatch?.[1] ?? `scheduler-${dataset}.csv`;

      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Ignore export errors to keep panel responsive.
    } finally {
      setExportBusy(null);
    }
  };

  const runExportNow = async () => {
    setExportRunBusy(true);
    setExportRunStatus(null);

    try {
      const response = await fetch('/api/dev/diagnostics/scheduler/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const payload = await response.json() as {
        ok: boolean;
        message: string;
        outputTail?: string[];
      };

      setExportRunStatus({
        ok: Boolean(payload.ok),
        message: payload.message || (payload.ok ? 'Export completed.' : 'Export failed.'),
        output: payload.outputTail ?? [],
      });
      await loadHistory();
    } catch (error) {
      setExportRunStatus({
        ok: false,
        message: error instanceof Error ? error.message : 'Export execution failed',
        output: [],
      });
    } finally {
      setExportRunBusy(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!autoRefresh || runningAny) return;
    const timer = window.setInterval(() => {
      void loadHistory();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, runningAny, loadHistory]);

  const runProfile = async (profile: SchedulerProfileItem['profile']) => {
    setStatusByProfile((current) => ({
      ...current,
      [profile]: {
        running: true,
        ok: null,
        message: 'Running scheduler profile...',
        output: [],
      },
    }));

    try {
      const response = await fetch('/api/dev/diagnostics/scheduler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      const payload = await response.json() as {
        id: string;
        ok: boolean;
        profile: SchedulerProfileItem['profile'];
        exitCode: number;
        durationMs: number;
        message: string;
        outputTail: string[];
        startedAt: string;
        finishedAt: string;
        actor: { userId: string; email: string };
      };

      setStatusByProfile((current) => ({
        ...current,
        [profile]: {
          running: false,
          ok: payload.ok,
          message: payload.message,
          output: payload.outputTail ?? [],
        },
      }));

      setHistoryByProfile((current) => ({
        ...current,
        [profile]: [
          {
            id: payload.id,
            profile: payload.profile,
            ok: payload.ok,
            exitCode: payload.exitCode,
            durationMs: payload.durationMs,
            message: payload.message,
            outputTail: payload.outputTail ?? [],
            startedAt: payload.startedAt,
            finishedAt: payload.finishedAt,
            actor: payload.actor,
          },
          ...(current[profile] ?? []),
        ].slice(0, 5),
      }));
      void loadHistory();
    } catch (error) {
      setStatusByProfile((current) => ({
        ...current,
        [profile]: {
          running: false,
          ok: false,
          message: error instanceof Error ? error.message : 'Scheduler run failed',
          output: [],
        },
      }));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => void loadHistory()} disabled={runningAny}>
          Refresh History
        </Button>
        <Button variant={autoRefresh ? 'primary' : 'ghost'} size="sm" onClick={() => setAutoRefresh((value) => !value)}>
          {autoRefresh ? 'Auto Refresh: On' : 'Auto Refresh: Off'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void downloadExport('events')}
          disabled={runningAny || exportBusy !== null}
        >
          {exportBusy === 'events' ? 'Exporting Events…' : 'Export Events CSV'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void downloadExport('runs')}
          disabled={runningAny || exportBusy !== null}
        >
          {exportBusy === 'runs' ? 'Exporting Runs…' : 'Export Runs CSV'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void downloadExport('summaries')}
          disabled={runningAny || exportBusy !== null}
        >
          {exportBusy === 'summaries' ? 'Exporting Summaries…' : 'Export Summary CSV'}
        </Button>
        <div className="flex items-center gap-1" role="group" aria-label="Summary window selector">
          {[10, 20, 50].map((windowSize) => (
            <Button
              key={windowSize}
              variant={summaryWindow === windowSize ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSummaryWindow(windowSize as 10 | 20 | 50)}
              disabled={runningAny}
            >
              {windowSize} runs
            </Button>
          ))}
        </div>
        {lastUpdatedAt && (
          <span className="aurora-label text-xs text-slate-500 dark:text-slate-400">
            Last updated {new Date(lastUpdatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      {globalSummary && (
        <div className="flex flex-wrap items-center gap-2" role="status" aria-label="Scheduler global summary">
          <Badge size="sm" variant={globalSummary.globalSuccessRate >= 90 ? 'success' : globalSummary.globalSuccessRate >= 70 ? 'warning' : 'error'}>
            Global Success {globalSummary.globalSuccessRate}%
          </Badge>
          <Badge size="sm" variant="default">Total Runs {globalSummary.totalRuns}</Badge>
          <Badge size="sm" variant="default">Passed {globalSummary.totalSuccesses}</Badge>
          {globalSummary.activeUnmutedIncidentProfiles.length > 0 && (
            <Badge size="sm" variant="error">Unmuted: {globalSummary.activeUnmutedIncidentProfiles.join(', ')}</Badge>
          )}
          {globalSummary.mutedIncidentProfiles.length > 0 && (
            <Badge size="sm" variant="warning">Muted: {globalSummary.mutedIncidentProfiles.join(', ')}</Badge>
          )}
          {globalSummary.activeIncidentProfiles.length > 0 && (
            <Badge size="sm" variant="error">Incident: {globalSummary.activeIncidentProfiles.join(', ')}</Badge>
          )}
          {globalSummary.escalatedProfiles.length > 0 && (
            <Badge size="sm" variant="error">Escalated: {globalSummary.escalatedProfiles.join(', ')}</Badge>
          )}
          {globalSummary.escalatedUnmutedProfiles.length > 0 && (
            <Badge size="sm" variant="error">Action Needed: {globalSummary.escalatedUnmutedProfiles.join(', ')}</Badge>
          )}
          <Badge size="sm" variant={globalSummary.notificationTargets.webhookConfigured ? 'success' : 'warning'}>
            Webhook {globalSummary.notificationTargets.webhookConfigured ? 'ready' : 'not set'}
          </Badge>
          <Badge size="sm" variant={globalSummary.notificationTargets.emailConfigured ? 'success' : 'warning'}>
            Email {globalSummary.notificationTargets.emailConfigured ? 'ready' : 'not set'}
          </Badge>
          {profiles.map((profileItem) => {
            const trend = profileTrendByName[profileItem.profile] ?? 'No data';
            const variant = trend === 'Improving'
              ? 'success'
              : trend === 'Declining'
                ? 'error'
                : trend === 'Stable'
                  ? 'default'
                  : 'warning';

            return (
              <Badge
                key={`trend-${profileItem.profile}`}
                size="sm"
                variant={variant}
                title={profileTrendTooltipByName[profileItem.profile] ?? undefined}
              >
                {profileItem.profile.toUpperCase()} {trend}
              </Badge>
            );
          })}
        </div>
      )}
      {escalationPolicy && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2">
          <p className="aurora-label text-xs text-slate-600 dark:text-slate-300">
            Escalation policy: failure streak ≥ {escalationPolicy.failureStreakThreshold},
            success rate ≤ {escalationPolicy.successRateThreshold}% over at least {escalationPolicy.minWindowRuns} runs.
          </p>
        </div>
      )}
      {exportStatus && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-900/20 px-3 py-2 space-y-1">
          <p className="aurora-label text-xs font-semibold text-emerald-800 dark:text-emerald-200">Last Export Snapshot</p>
          <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">
            {exportStatus.lastGeneratedAt ? new Date(exportStatus.lastGeneratedAt).toLocaleString() : 'Not generated yet'}
            {exportStatus.runId ? ` · ${exportStatus.runId}` : ''}
          </p>
          {exportStatus.outputDir && (
            <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">{exportStatus.outputDir}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(exportStatus.datasets || {}).map(([name, dataset]) => (
              <Badge key={`export-${name}`} size="sm" variant="success">
                {name}: {dataset.count}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void runExportNow()}
              disabled={runningAny || exportRunBusy}
            >
              {exportRunBusy ? 'Running Export…' : 'Run Export Now'}
            </Button>
            {exportRunStatus && (
              <Badge size="sm" variant={exportRunStatus.ok ? 'success' : 'error'}>
                {exportRunStatus.ok ? 'Export Passed' : 'Export Failed'}
              </Badge>
            )}
          </div>
          {exportRunStatus && (
            <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">
              {exportRunStatus.message}
            </p>
          )}
          {exportRunStatus && exportRunStatus.output.length > 0 && (
            <div className="rounded-lg bg-slate-950 text-slate-100 p-2 text-[11px] max-h-24 overflow-auto">
              {exportRunStatus.output.slice(-8).map((line, index) => (
                <p key={`export-run-out-${index}`} className="aurora-label leading-relaxed">{line}</p>
              ))}
            </div>
          )}
          {exportStatus.retention && (
            <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">
              Retention {exportStatus.retention.policyDays}d · kept {exportStatus.retention.retainedDayFolders} days · removed {exportStatus.retention.deletedDayFolders} days / {exportStatus.retention.deletedRunFolders} runs
            </p>
          )}
          {exportStatus.trends && exportStatus.trends.latest && (
            <div className="space-y-1">
              <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">
                Trend snapshots: {exportStatus.trends.historyCount}
              </p>
              <div className="flex flex-wrap items-center gap-1" role="list" aria-label="Trend snapshot labels">
                {(['dev', 'runtime', 'ci', 'full'] as const).map((profile) => {
                  const latestLabel = exportStatus.trends.latest?.profiles?.[profile]?.label ?? 'No data';
                  const previousLabel = exportStatus.trends.previous?.profiles?.[profile]?.label ?? null;
                  const latestRate = exportStatus.trends.latest?.profiles?.[profile]?.recentSuccessRate ?? null;
                  const previousRate = exportStatus.trends.previous?.profiles?.[profile]?.recentSuccessRate ?? null;
                  const latestSampleSize = exportStatus.trends.latest?.profiles?.[profile]?.sampleSize ?? null;
                  const previousSampleSize = exportStatus.trends.previous?.profiles?.[profile]?.sampleSize ?? null;
                  const { deltaRate, tooltip: deltaTooltip } = computeExportTrendDelta(
                    latestRate,
                    latestSampleSize,
                    previousRate,
                    previousSampleSize
                  );
                  const drift = previousLabel && previousLabel !== latestLabel
                    ? `${previousLabel}→${latestLabel}`
                    : latestLabel;
                  const variant = latestLabel === 'Improving'
                    ? 'success'
                    : latestLabel === 'Declining'
                      ? 'error'
                      : latestLabel === 'Stable'
                        ? 'default'
                        : 'warning';

                  return (
                    <div key={`trend-snapshot-${profile}`} className="flex items-center gap-1">
                      <Badge size="sm" variant={variant}>
                        {profile.toUpperCase()} {drift}
                      </Badge>
                      {deltaRate != null && (
                        <Badge
                          size="sm"
                          variant={deltaRate > 0 ? 'success' : deltaRate < 0 ? 'error' : 'default'}
                          title={deltaTooltip ?? undefined}
                        >
                          {deltaRate > 0 ? `+${deltaRate}%` : `${deltaRate}%`}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {exportStatus.manualRuns && exportStatus.manualRuns.length > 0 && (
            <div className="space-y-1" role="list" aria-label="Manual export run history">
              <div className="flex items-center justify-between gap-2">
                <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">Recent manual exports</p>
                <div className="flex items-center gap-1" role="group" aria-label="Manual export history filter">
                  <Badge size="sm" variant="default" title={manualExportTrendTooltip ?? undefined}>
                    Trend {manualExportTrend.label}
                  </Badge>
                  <Badge size="sm" variant="default" title={manualExportTrendTooltip ?? undefined}>
                    {manualExportTrend.sparkline}
                  </Badge>
                  <Badge
                    size="sm"
                    variant={filteredManualExportSuccessRate >= 90 ? 'success' : filteredManualExportSuccessRate >= 70 ? 'warning' : 'error'}
                    title={manualExportTrendTooltip ?? undefined}
                  >
                    Success {filteredManualExportSuccessRate}%
                  </Badge>
                  <Button
                    variant={exportHistoryFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setExportHistoryFilter('all')}
                    disabled={runningAny}
                  >
                    All
                  </Button>
                  <Button
                    variant={exportHistoryFilter === 'success' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setExportHistoryFilter('success')}
                    disabled={runningAny}
                  >
                    Success
                  </Button>
                  <Button
                    variant={exportHistoryFilter === 'failed' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setExportHistoryFilter('failed')}
                    disabled={runningAny}
                  >
                    Failed
                  </Button>
                </div>
              </div>
              {filteredManualExportRuns.slice(0, 3).map((run) => (
                <p key={run.id} role="listitem" className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">
                  {run.ok ? 'Passed' : 'Failed'} · exit {run.exitCode} · {formatDuration(run.durationMs)} · {new Date(run.finishedAt).toLocaleString()} · {run.actor.email}
                </p>
              ))}
              {filteredManualExportRuns.length === 0 && (
                <p className="aurora-label text-[11px] text-emerald-900 dark:text-emerald-100">No records for selected filter.</p>
              )}
            </div>
          )}
        </div>
      )}
      {changeFeed.length > 0 && (
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-900/20 px-3 py-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="aurora-label text-xs font-semibold text-indigo-800 dark:text-indigo-200">Changes Since Last Refresh</p>
            <Button variant="ghost" size="sm" onClick={() => setChangeFeed([])} disabled={runningAny}>Clear</Button>
          </div>
          <div className="space-y-1" role="list" aria-label="Recent escalation changes">
            {changeFeed.slice(0, 6).map((event) => (
              <p key={`delta-${event.id}`} role="listitem" className="aurora-label text-[11px] text-indigo-900 dark:text-indigo-100">
                {new Date(event.at).toLocaleTimeString()} · {event.profile.toUpperCase()} · {event.message}
              </p>
            ))}
          </div>
        </div>
      )}
      {escalationEvents.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 space-y-2">
          <p className="aurora-label text-xs font-semibold text-slate-700 dark:text-slate-200">Escalation Timeline</p>
          <div className="space-y-1" role="list" aria-label="Escalation timeline">
            {escalationEvents.slice(0, 10).map((event) => (
              <p key={event.id} role="listitem" className="aurora-label text-[11px] text-slate-600 dark:text-slate-300">
                {new Date(event.at).toLocaleString()} · {event.profile.toUpperCase()} · {event.type} · {event.message}
              </p>
            ))}
          </div>
        </div>
      )}
      {activeIncidents.length > 0 && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-900/20 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="aurora-label text-sm font-semibold text-rose-800 dark:text-rose-200">Active Incidents</p>
            <Badge size="sm" variant="error">{activeIncidents.length} affected</Badge>
          </div>
          <div className="space-y-2" role="list" aria-label="Active scheduler incidents">
            {activeIncidents.map((incident) => (
              (() => {
                const incidentStatus = incidentStatusByProfile[incident.profile];
                const ackBusy = ackBusyByProfile[incident.profile] === true;

                return (
              <div
                key={`incident-${incident.profile}`}
                role="listitem"
                className="rounded-lg border border-rose-200/80 dark:border-rose-900/70 bg-white/80 dark:bg-slate-950/60 px-3 py-2 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm" variant="error">{incident.profile.toUpperCase()}</Badge>
                    <Badge size="sm" variant="error">Streak {incident.summary.consecutiveFailures}</Badge>
                    <Badge size="sm" variant="warning">Window {incident.summary.windowRuns}</Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void runProfile(incident.profile)}
                    disabled={runningAny}
                  >
                    Run Recovery
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {incidentStatus?.isMuted ? (
                    <Badge size="sm" variant="warning">
                      Muted until {incidentStatus.mutedUntil ? new Date(incidentStatus.mutedUntil).toLocaleTimeString() : 'n/a'}
                    </Badge>
                  ) : (
                    <Badge size="sm" variant="error">Unmuted</Badge>
                  )}
                  {incidentStatus?.acknowledgedAt && (
                    <Badge size="sm" variant="default">
                      Ack {new Date(incidentStatus.acknowledgedAt).toLocaleTimeString()}
                    </Badge>
                  )}
                  {escalationByProfile[incident.profile] && (
                    <Badge size="sm" variant={escalationByProfile[incident.profile]?.severity === 'high' ? 'error' : 'warning'}>
                      Escalated {escalationByProfile[incident.profile]?.severity}
                    </Badge>
                  )}
                </div>
                {escalationByProfile[incident.profile] && (
                  <p className="aurora-label text-[11px] text-rose-700 dark:text-rose-300">
                    Escalation reason: {escalationByProfile[incident.profile]?.reasons.join(', ')}
                    {escalationByProfile[incident.profile]?.suppressedByMute ? ' (suppressed by mute)' : ''}
                  </p>
                )}
                {incident.latestFailure && (
                  <p className="aurora-label text-xs text-slate-700 dark:text-slate-300">
                    Latest failure: exit {incident.latestFailure.exitCode} · {new Date(incident.latestFailure.finishedAt).toLocaleString()} · {formatDuration(incident.latestFailure.durationMs)}
                  </p>
                )}
                {incident.failedRuns.length > 0 && (
                  <div className="space-y-1" role="list" aria-label={`${incident.profile} incident events`}>
                    {incident.failedRuns.map((run) => (
                      <p key={run.id} role="listitem" className="aurora-label text-[11px] text-slate-600 dark:text-slate-400">
                        {new Date(run.finishedAt).toLocaleTimeString()} · exit {run.exitCode} · {run.message}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void acknowledgeIncident(incident.profile, 'mute30')}
                    disabled={ackBusy || runningAny}
                  >
                    {ackBusy ? 'Updating…' : 'Mute 30m'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void acknowledgeIncident(incident.profile, 'clear')}
                    disabled={ackBusy || runningAny}
                  >
                    Clear Ack
                  </Button>
                </div>
              </div>
                );
              })()
            ))}
          </div>
        </div>
      )}
      <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-900/20 px-3 py-2">
        <p className="aurora-label text-xs text-amber-900 dark:text-amber-200">
          Admin access required for profile runs. Configure allowlist with <strong>AURORA_ADMIN_EMAILS</strong> (comma-separated)
          or <strong>AURORA_ADMIN_EMAIL</strong>.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Diagnostics scheduler profiles">
        {profiles.map((item) => {
        const status = statusByProfile[item.profile] ?? emptyStatus;
        const summary = summaryByProfile[item.profile];
        const recentRuns = historyByProfile[item.profile] ?? [];

          return (
            <Card key={item.profile} role="listitem" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{item.profile.toUpperCase()} Profile</CardTitle>
              <span className="aurora-label text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300">
                {item.jobs.length} jobs
              </span>
            </div>
            <CardDescription>{item.description}</CardDescription>
            <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">Run command: {item.command}</p>
            {summary && (
              <div className="flex flex-wrap items-center gap-2" role="status" aria-label={`${item.profile} profile summary`}>
                <Badge size="sm" variant={summary.successRate >= 90 ? 'success' : summary.successRate >= 70 ? 'warning' : 'error'}>
                  Success {summary.successRate}%
                </Badge>
                <Badge size="sm" variant="default">Runs {summary.windowRuns}/{summary.totalRuns}</Badge>
                <Badge size="sm" variant="default">Avg {formatDuration(summary.averageDurationMs)}</Badge>
                {summary.consecutiveFailures > 0 && (
                  <Badge size="sm" variant={summary.consecutiveFailures >= 2 ? 'error' : 'warning'}>
                    Failure Streak {summary.consecutiveFailures}
                  </Badge>
                )}
                {escalationByProfile[item.profile] && (
                  <Badge size="sm" variant={escalationByProfile[item.profile]?.severity === 'high' ? 'error' : 'warning'}>
                    Escalation {escalationByProfile[item.profile]?.severity}
                  </Badge>
                )}
              </div>
            )}
            <div className="space-y-1" role="list" aria-label={`${item.profile} profile jobs`}>
              {item.jobs.map((job) => (
                <p
                  key={`${item.profile}-${job}`}
                  role="listitem"
                  className="aurora-label text-xs rounded-md bg-slate-50 dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-300"
                >
                  {job}
                </p>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void runProfile(item.profile)}
                disabled={status.running || runningAny}
              >
                {status.running ? 'Running…' : 'Run Profile'}
              </Button>
              {status.ok === true && <Badge size="sm" variant="success">Passed</Badge>}
              {status.ok === false && <Badge size="sm" variant="error">Failed</Badge>}
            </div>
            {status.message && (
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{status.message}</p>
            )}
            {status.output.length > 0 && (
              <div className="rounded-lg bg-slate-950 text-slate-100 p-2 text-[11px] max-h-36 overflow-auto">
                {status.output.map((line, index) => (
                  <p key={`${item.profile}-out-${index}`} className="aurora-label leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}
            {recentRuns.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 space-y-1">
                <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Recent Runs</p>
                <div className="space-y-1" role="list" aria-label={`${item.profile} recent runs`}>
                  {recentRuns.slice(0, 3).map((run) => (
                    <p key={run.id} role="listitem" className="aurora-label text-xs text-slate-700 dark:text-slate-300">
                      {run.ok ? 'Passed' : 'Failed'} · exit {run.exitCode} · {formatDuration(run.durationMs)} · {new Date(run.finishedAt).toLocaleString()}
                    </p>
                  ))}
                </div>
                <p className="aurora-label text-[11px] text-slate-500 dark:text-slate-400">
                  Last actor: {recentRuns[0]?.actor.email}
                </p>
                {summary?.lastSuccessAt && (
                  <p className="aurora-label text-[11px] text-slate-500 dark:text-slate-400">
                    Last success: {new Date(summary.lastSuccessAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
