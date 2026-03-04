'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface LatestDiagnostics {
  timestamp: string;
  type: 'api' | 'platform';
  ok: boolean;
  totals: {
    passed: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
  diffs?: {
    passedDelta: number;
    failedDelta: number;
    skippedDelta: number;
  };
  universeCoverage?: {
    total: number;
    byUniverse: Record<string, number>;
  };
}

interface HistoryPoint {
  timestamp: string;
  ok: boolean;
  totals: {
    passed: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
}

interface HistoryStats {
  mean: number;
  std: number;
  low: number;
  high: number;
  samples: number;
}

interface ReadinessReport {
  score: number;
  grade: string;
  signals: string[];
  timestamp: string;
}

interface CompareReport {
  ok: boolean;
  deltas: {
    passed: number;
    failed: number;
    skipped: number;
    p95: number | null;
    errorRate: number | null;
  };
  stable: { baseUrl: string };
  canary: { baseUrl: string };
}

interface CompareHistoryItem {
  timestamp: string;
  deltas: { p95: number | null; errorRate: number | null; failed: number };
}

interface AlertsReport {
  updatedAt: string | null;
  jobs: Record<string, { name: string; exitCode: number; ok: boolean; lastRunAt: string }>;
}

export default function DiagnosticsPage() {
  const [apiLatest, setApiLatest] = useState<LatestDiagnostics | null>(null);
  const [platformLatest, setPlatformLatest] = useState<LatestDiagnostics | null>(null);
  const [apiHistory, setApiHistory] = useState<HistoryPoint[]>([]);
  const [platformHistory, setPlatformHistory] = useState<HistoryPoint[]>([]);
  const [apiHistoryStats, setApiHistoryStats] = useState<HistoryStats | null>(null);
  const [platformHistoryStats, setPlatformHistoryStats] = useState<HistoryStats | null>(null);
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [compare, setCompare] = useState<CompareReport | null>(null);
  const [compareHistory, setCompareHistory] = useState<CompareHistoryItem[]>([]);
  const [alerts, setAlerts] = useState<AlertsReport | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const [apiRes, platformRes, apiHistoryRes, platformHistoryRes, readinessRes, compareRes, compareHistoryRes, alertsRes] = await Promise.all([
        fetch('/api/dev/diagnostics/api'),
        fetch('/api/dev/diagnostics/platform'),
        fetch('/api/dev/diagnostics/history/api?limit=12'),
        fetch('/api/dev/diagnostics/history/platform?limit=12'),
        fetch('/api/dev/diagnostics/readiness'),
        fetch('/api/dev/diagnostics/compare'),
        fetch('/api/dev/diagnostics/compare/history'),
        fetch('/api/dev/diagnostics/alerts'),
      ]);

      if (apiRes.ok) {
        const api = await apiRes.json();
        setApiLatest(api);
      }

      if (platformRes.ok) {
        const platform = await platformRes.json();
        setPlatformLatest(platform);
      }

      if (apiHistoryRes.ok) {
        const apiHistoryData = await apiHistoryRes.json();
        setApiHistory(apiHistoryData.items || []);
        setApiHistoryStats(apiHistoryData.stats || null);
      }

      if (platformHistoryRes.ok) {
        const platformHistoryData = await platformHistoryRes.json();
        setPlatformHistory(platformHistoryData.items || []);
        setPlatformHistoryStats(platformHistoryData.stats || null);
      }

      if (readinessRes.ok) {
        const readinessData = await readinessRes.json();
        setReadiness(readinessData);
      }

      if (compareRes.ok) {
        const compareData = await compareRes.json();
        setCompare(compareData);
      }

      if (compareHistoryRes.ok) {
        const compareHistoryData = await compareHistoryRes.json();
        setCompareHistory(compareHistoryData.items || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      setError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchHistories, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const renderSparkline = (history: HistoryPoint[]) => {
    if (!history || history.length === 0) {
      return <div className="text-xs text-slate-400">No history yet</div>;
    }

    const values = history.map((item) => item.totals.failed);
    const max = Math.max(...values, 1);
    const width = 160;
    const height = 40;
    const step = history.length > 1 ? width / (history.length - 1) : width;
    const points = values
      .map((value, index) => {
        const x = index * step;
        const y = height - Math.round((value / max) * height);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="block">
        <polyline
          fill="none"
          stroke="#0f172a"
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  const renderCompareSparkline = (history: CompareHistoryItem[]) => {
    if (!history || history.length === 0) {
      return <div className="text-xs text-slate-400">No compare history yet</div>;
    }
    const values = history.map((item) => item.deltas.p95 ?? 0);
    const max = Math.max(...values.map((value) => Math.abs(value)), 1);
    const width = 160;
    const height = 40;
    const step = history.length > 1 ? width / (history.length - 1) : width;
    const points = values
      .map((value, index) => {
        const x = index * step;
        const y = height - Math.round(((value + max) / (max * 2)) * height);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="block">
        <polyline fill="none" stroke="#0f172a" strokeWidth="2" points={points} />
      </svg>
    );
  };

  const renderAnomalyBand = (history: HistoryPoint[], stats: HistoryStats | null) => {
    if (stats && stats.samples > 0) {
      return <div className="text-xs text-slate-500">Band: {stats.low} - {stats.high} failures</div>;
    }
    if (!history || history.length === 0) {
      return <div className="text-xs text-slate-400">Band: n/a</div>;
    }
    const values = history.map((item) => item.totals.failed);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const low = Math.max(0, Math.round(mean - std));
    const high = Math.round(mean + std);
    return <div className="text-xs text-slate-500">Band: {low} - {high} failures</div>;
  };

  const isLatestOutlier = (history: HistoryPoint[], stats: HistoryStats | null) => {
    if (!history || history.length < 3) return false;
    if (stats && stats.samples > 0) {
      return history[history.length - 1].totals.failed > Math.round(stats.high * 1.5);
    }
    const values = history.map((item) => item.totals.failed);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const high = Math.round(mean + std * 1.5);
    return values[values.length - 1] > high;
  };

  const renderCard = (title: string, diag: LatestDiagnostics | null) => {
    if (!diag) {
      return (
        <div className="card p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <p className="text-sm text-slate-500">No data available</p>
        </div>
      );
    }

    return (
      <div className={`card p-6 rounded-2xl border ${diag.ok ? 'border-emerald-200/70 bg-white/90' : 'border-rose-200/70 bg-white/90'} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${diag.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {diag.ok ? 'PASS' : 'FAIL'}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={diag.ok ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
              {diag.ok ? '✓ PASS' : '✗ FAIL'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Passed / Failed / Skipped:</span>
            <span>
              {diag.totals.passed} / {diag.totals.failed} / {diag.totals.skipped}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{(diag.totals.durationMs / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex justify-between">
            <span>Last Run:</span>
            <span className="text-xs">{new Date(diag.timestamp).toLocaleString()}</span>
          </div>

          {diag.diffs && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs font-medium text-slate-700 mb-2">Δ vs Baseline</div>
              <div className="flex justify-between text-xs">
                <span>Passed: {diag.diffs.passedDelta >= 0 ? '+' : ''}{diag.diffs.passedDelta}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Failed: {diag.diffs.failedDelta >= 0 ? '+' : ''}{diag.diffs.failedDelta}</span>
              </div>
            </div>
          )}

          {diag.universeCoverage && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-xs font-medium text-slate-700 mb-2">Universe Coverage ({diag.universeCoverage.total} endpoints)</div>
              <div className="space-y-1 text-xs">
                {Object.entries(diag.universeCoverage.byUniverse).map(([name, count]) => (
                  <div key={name} className="flex justify-between">
                    <span>{name}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-slate-900" style={{ fontFamily: '"Space Grotesk", "Sora", "Segoe UI", sans-serif' }}>
      <div className="pointer-events-none absolute -top-24 left-0 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10">
        {/* Header */}
        <div className="mb-10 rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Aurora Diagnostics</p>
              <h1 className="text-4xl font-semibold text-slate-900">Platform Signal Console</h1>
              <p className="mt-2 text-slate-600">Monitor API, platform, and database health across all universes with clarity and context.</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div className="rounded-full bg-slate-100 px-4 py-2">Refresh: {lastUpdated || 'not yet'}</div>
              <div className="rounded-full bg-slate-100 px-4 py-2">Auto-refresh: {autoRefresh ? 'On' : 'Off'}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={fetchHistories} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button variant={autoRefresh ? 'primary' : 'secondary'} onClick={() => setAutoRefresh(!autoRefresh)}>
              {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {renderCard('API Diagnostics', apiLatest)}
            <div className="mt-3">
              <Link className="text-sm text-slate-600 underline" href="/dev/diagnostics/api">View details</Link>
            </div>
          </div>
          <div>
            {renderCard('Platform Diagnostics', platformLatest)}
            <div className="mt-3">
              <Link className="text-sm text-slate-600 underline" href="/dev/diagnostics/platform">View details</Link>
            </div>
          </div>
        </div>

        {/* Release Readiness */}
        <div className="mt-8 p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Release Readiness</h3>
            <span className="text-xs text-slate-500">latest scorecard</span>
          </div>
          {readiness ? (
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="px-3 py-2 rounded-md bg-slate-100">Score: {readiness.score}</div>
              <div className="px-3 py-2 rounded-md bg-slate-100">Grade: {readiness.grade}</div>
              <div className="px-3 py-2 rounded-md bg-slate-100">Signals: {readiness.signals?.length || 0}</div>
              <div className="text-xs text-slate-500">Updated: {new Date(readiness.timestamp).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">No readiness data yet. Run `npm run diagnostics:readiness`.</div>
          )}
        </div>

        {/* Canary Compare */}
        <div className="mt-8 p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Canary vs Stable</h3>
            <span className="text-xs text-slate-500">compare report</span>
          </div>
          {compare ? (
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span>Stable:</span><span className="text-xs">{compare.stable?.baseUrl}</span></div>
              <div className="flex justify-between"><span>Canary:</span><span className="text-xs">{compare.canary?.baseUrl}</span></div>
              <div className="flex justify-between"><span>p95 Delta:</span><span>{compare.deltas.p95 ?? 'n/a'}</span></div>
              <div className="flex justify-between"><span>Error Rate Delta:</span><span>{compare.deltas.errorRate ?? 'n/a'}</span></div>
              <div className="flex justify-between"><span>Fail Delta:</span><span>{compare.deltas.failed}</span></div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">No compare data yet. Run `npm run diagnostics:compare`.</div>
          )}
        </div>

        {/* Trends */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">API Fail Trend</h3>
              <span className="text-xs text-slate-500">last 12 runs</span>
            </div>
            {renderSparkline(apiHistory)}
            {renderAnomalyBand(apiHistory, apiHistoryStats)}
            {isLatestOutlier(apiHistory, apiHistoryStats) && (
              <div className="mt-2 text-xs text-amber-700">Anomaly detected: latest run above band</div>
            )}
          </div>
          <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Platform Fail Trend</h3>
              <span className="text-xs text-slate-500">last 12 runs</span>
            </div>
            {renderSparkline(platformHistory)}
            {renderAnomalyBand(platformHistory, platformHistoryStats)}
            {isLatestOutlier(platformHistory, platformHistoryStats) && (
              <div className="mt-2 text-xs text-amber-700">Anomaly detected: latest run above band</div>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Canary p95 Delta Trend</h3>
            <span className="text-xs text-slate-500">compare history</span>
          </div>
          {renderCompareSparkline(compareHistory)}
        </div>

        {/* Scheduler Alerts */}
        <div className="mt-8 p-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Scheduler Alerts</h3>
            <span className="text-xs text-slate-500">latest job statuses</span>
          </div>
          {alerts && Object.keys(alerts.jobs || {}).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.values(alerts.jobs).map((job) => (
                <div key={job.name} className="flex items-center justify-between">
                  <span>{job.name}</span>
                  <span className={job.ok ? 'text-green-700' : 'text-red-700'}>
                    {job.ok ? 'OK' : `FAIL (${job.exitCode})`}
                  </span>
                </div>
              ))}
              {alerts.updatedAt && (
                <div className="text-xs text-slate-500">Updated: {new Date(alerts.updatedAt).toLocaleString()}</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-400">No scheduler alerts yet. Run `npm run diagnostics:schedule:once`.</div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
          <p>
            <strong>Quick Commands:</strong>
          </p>
          <ul className="mt-3 space-y-1 font-mono text-xs">
            <li>npm run api:diagnose</li>
            <li>npm run api:diagnose:summary</li>
            <li>npm run platform:diagnose</li>
            <li>npm run platform:diagnose:summary</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
