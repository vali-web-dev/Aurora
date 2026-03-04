'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';

type RuntimeSummary = {
  totalEvents: number;
  actionSuccesses: number;
  actionFailures: number;
  importSuccesses: number;
  importFailures: number;
  circuitBlocked: number;
  retriesUsed: number;
  errorRatePercent: number;
  lastEventAt: string | null;
};

type RuntimeEvent = {
  type: string;
  operation: string;
  timestamp: string;
  message?: string;
  circuit?: 'action' | 'import';
};

type RuntimeTrendPoint = {
  bucketStart: string;
  totalOps: number;
  failures: number;
  errorRatePercent: number;
  circuitBlocked: number;
};

type RuntimeAlert = {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
};

type RuntimePayload = {
  summary: RuntimeSummary;
  windows: {
    oneHour: RuntimeSummary;
    twentyFourHours: RuntimeSummary;
  };
  alerts: RuntimeAlert[];
  trend: {
    hourly24h: RuntimeTrendPoint[];
  };
  events: RuntimeEvent[];
  persisted: {
    historyFile: string;
    persistedEvents: number;
  };
};

export function EditorRuntimeDiagnosticsPanel() {
  const [summary, setSummary] = useState<RuntimeSummary | null>(null);
  const [window1h, setWindow1h] = useState<RuntimeSummary | null>(null);
  const [window24h, setWindow24h] = useState<RuntimeSummary | null>(null);
  const [hourlyTrend, setHourlyTrend] = useState<RuntimeTrendPoint[]>([]);
  const [alerts, setAlerts] = useState<RuntimeAlert[]>([]);
  const [persistedEvents, setPersistedEvents] = useState(0);
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnostics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dev/diagnostics/editor-runtime?limit=8', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Diagnostics request failed (${response.status})`);
      }
      const payload = await response.json() as RuntimePayload;
      setSummary(payload.summary);
      setWindow1h(payload.windows.oneHour);
      setWindow24h(payload.windows.twentyFourHours);
      setAlerts(payload.alerts ?? []);
      setHourlyTrend(payload.trend.hourly24h);
      setPersistedEvents(payload.persisted.persistedEvents);
      setEvents(payload.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load diagnostics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDiagnostics();
  }, [fetchDiagnostics]);

  const reliabilityStatus = useMemo(() => {
    if (!summary) return { label: 'Unknown', variant: 'default' as const };
    if (summary.errorRatePercent <= 1 && summary.circuitBlocked === 0) return { label: 'Healthy', variant: 'success' as const };
    if (summary.errorRatePercent <= 5) return { label: 'Degraded', variant: 'warning' as const };
    return { label: 'At Risk', variant: 'error' as const };
  }, [summary]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Editor Runtime Diagnostics</CardTitle>
          <CardDescription>Live reliability telemetry from editor action/import pipelines.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="sm" variant={reliabilityStatus.variant}>{reliabilityStatus.label}</Badge>
          <Button variant="secondary" size="sm" onClick={() => void fetchDiagnostics()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && <p className="aurora-label text-sm text-red-600 dark:text-red-400">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Error Rate</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">{summary.errorRatePercent}%</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Circuit Blocks</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">{summary.circuitBlocked}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Retries Used</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">{summary.retriesUsed}</p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Persisted Events</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">{persistedEvents}</p>
          </div>
        </div>
      )}

      {window1h && window24h && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Last 1 Hour</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">{window1h.errorRatePercent}% error rate</p>
            <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-1">
              {window1h.actionSuccesses + window1h.importSuccesses} success · {window1h.actionFailures + window1h.importFailures} failures
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">Last 24 Hours</p>
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">{window24h.errorRatePercent}% error rate</p>
            <p className="aurora-label text-xs text-slate-600 dark:text-slate-400 mt-1">
              {window24h.actionSuccesses + window24h.importSuccesses} success · {window24h.actionFailures + window24h.importFailures} failures
            </p>
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2">
          <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">Active Alerts</p>
          <div className="space-y-2" role="list" aria-label="Runtime alerts">
            {alerts.map((alert) => (
              <div key={alert.id} role="listitem" className="rounded-lg border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-900/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Badge size="sm" variant={alert.severity === 'critical' ? 'error' : 'warning'}>{alert.severity}</Badge>
                  <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hourlyTrend.length > 0 && (
        <div className="space-y-2">
          <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">24h Hourly Error Trend</p>
          <div className="grid grid-cols-12 gap-1 items-end h-24 rounded-lg border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/40">
            {hourlyTrend.slice(-12).map((point) => {
              const height = Math.max(6, Math.min(100, Math.round(point.errorRatePercent * 6) + (point.failures > 0 ? 8 : 0)));
              const colorClass = point.errorRatePercent > 5
                ? 'bg-red-500/80'
                : point.errorRatePercent > 1
                  ? 'bg-amber-500/80'
                  : 'bg-emerald-500/80';
              return (
                <div key={point.bucketStart} className="flex flex-col items-center justify-end h-full" title={`${new Date(point.bucketStart).toLocaleTimeString()} · ${point.errorRatePercent}%`}>
                  <div className={`w-full rounded-sm ${colorClass}`} style={{ height: `${height}%` }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2" role="list" aria-label="Recent editor runtime events">
        {events.length === 0 && !loading && (
          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">No telemetry events yet. Use the editor and refresh to populate.</p>
        )}
        {events.slice().reverse().map((event, index) => (
          <div key={`${event.timestamp}-${event.operation}-${index}`} role="listitem" className="rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2">
            <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{event.type} · {event.operation}</p>
            <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">
              {new Date(event.timestamp).toLocaleString()} {event.circuit ? `· ${event.circuit} circuit` : ''}
            </p>
            {event.message && (
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-300 mt-1">{event.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/create/editor">
          <Button variant="primary" size="sm">Open Editor</Button>
        </Link>
        <Link href="/api/dev/diagnostics/editor-runtime?limit=25">
          <Button variant="ghost" size="sm">View JSON</Button>
        </Link>
        <Link href="/api/dev/diagnostics/editor-runtime/export?profile=balanced">
          <Button variant="ghost" size="sm">CI Export</Button>
        </Link>
      </div>
    </Card>
  );
}
