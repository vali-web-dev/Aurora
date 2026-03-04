'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface CheckResult {
  name: string;
  ok: boolean;
  skipped?: boolean;
  exitCode?: number;
  durationMs?: number;
  note?: string;
  metrics?: Record<string, unknown>;
  results?: Array<Record<string, unknown>>;
  checks?: Array<Record<string, unknown>>;
}

interface DiagnosticsDetails {
  timestamp: string;
  ok: boolean;
  totals: {
    passed: number;
    failed: number;
    skipped: number;
    durationMs: number;
  };
  checks: CheckResult[];
  baseUrl?: string | null;
  exitReason?: string;
}

export default function DiagnosticsDetailsPage({ params }: { params: { type: string } }) {
  const type = params.type;
  const [details, setDetails] = useState<DiagnosticsDetails | null>(null);
  const [filter, setFilter] = useState<'all' | 'failed' | 'ok' | 'skipped'>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copy JSON');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dev/diagnostics/details/${type}`);
        if (!res.ok) {
          setError('No diagnostics data found.');
          setDetails(null);
          return;
        }
        const payload = await res.json();
        setDetails(payload);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load diagnostics.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type]);

  const filteredChecks = useMemo(() => {
    if (!details?.checks) return [];
    const base = (() => {
      switch (filter) {
        case 'failed':
          return details.checks.filter((check) => !check.ok && !check.skipped);
        case 'ok':
          return details.checks.filter((check) => check.ok && !check.skipped);
        case 'skipped':
          return details.checks.filter((check) => check.skipped);
        default:
          return details.checks;
      }
    })();

    if (!query.trim()) return base;
    const needle = query.trim().toLowerCase();
    return base.filter((check) => check.name.toLowerCase().includes(needle));
  }, [details, filter, query]);

  const tagForCheck = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes('perf')) return 'perf';
    if (normalized.includes('schema')) return 'schema';
    if (normalized.includes('auth')) return 'auth';
    if (normalized.includes('openapi')) return 'openapi';
    if (normalized.includes('health')) return 'health';
    if (normalized.includes('route')) return 'routes';
    if (normalized.includes('dependencies')) return 'dependencies';
    if (normalized.includes('preflight')) return 'preflight';
    if (normalized.includes('flaky')) return 'flaky';
    if (normalized.includes('regression')) return 'regression';
    return 'general';
  };

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredChecks.length / pageSize));
  const pagedChecks = filteredChecks.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  return (
    <div className="min-h-screen bg-[#f6f2e9] text-slate-900" style={{ fontFamily: '"Space Grotesk", "Sora", "Segoe UI", sans-serif' }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Diagnostics Detail</p>
              <h1 className="text-3xl font-semibold">{type === 'platform' ? 'Platform' : 'API'} Checks</h1>
              {details?.timestamp && (
                <p className="text-sm text-slate-600">Last run: {new Date(details.timestamp).toLocaleString()}</p>
              )}
            </div>
            <Link href="/dev/diagnostics">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'failed' ? 'primary' : 'secondary'} onClick={() => setFilter('failed')}>Failed</Button>
            <Button variant={filter === 'ok' ? 'primary' : 'secondary'} onClick={() => setFilter('ok')}>Passed</Button>
            <Button variant={filter === 'skipped' ? 'primary' : 'secondary'} onClick={() => setFilter('skipped')}>Skipped</Button>
            <input
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700"
              placeholder="Search check name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!details) return;
                const blob = new Blob([JSON.stringify(details, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `diagnostics-${type}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download JSON
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!details) return;
                try {
                  await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
                  setCopyLabel('Copied!');
                  setTimeout(() => setCopyLabel('Copy JSON'), 1500);
                } catch {
                  setCopyLabel('Copy failed');
                  setTimeout(() => setCopyLabel('Copy JSON'), 1500);
                }
              }}
            >
              {copyLabel}
            </Button>
          </div>
          {details && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">Passed: {details.totals.passed}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Failed: {details.totals.failed}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Skipped: {details.totals.skipped}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Duration: {details.totals.durationMs} ms</span>
            </div>
          )}
        </div>

        {loading && <div className="text-sm text-slate-500">Loading diagnostics...</div>}
        {error && <div className="text-sm text-rose-700">{error}</div>}

        {details && (
          <div className="grid gap-4">
            {pagedChecks.map((check) => {
              const isOpen = expanded[check.name] ?? false;
              return (
                <div key={check.name} className={`rounded-2xl border ${check.skipped ? 'border-amber-200/70' : check.ok ? 'border-emerald-200/70' : 'border-rose-200/70'} bg-white/90 p-5 shadow-sm`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{check.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Duration: {(check.durationMs || 0)} ms</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-600">
                          {tagForCheck(check.name)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${check.skipped ? 'bg-amber-100 text-amber-700' : check.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {check.skipped ? 'SKIPPED' : check.ok ? 'PASS' : 'FAIL'}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => setExpanded((prev) => ({ ...prev, [check.name]: !isOpen }))}
                      >
                        {isOpen ? 'Hide' : 'Details'}
                      </Button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-3 text-sm text-slate-600">
                      {check.exitCode !== undefined && <div>Exit Code: {check.exitCode}</div>}
                      {check.note && <div className="mt-2 text-xs text-slate-500">{check.note}</div>}
                      {(check.metrics || check.results || check.checks) && (
                        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-900/90 p-3 text-xs text-slate-100">
                          {JSON.stringify({ metrics: check.metrics, results: check.results, checks: check.checks }, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredChecks.length === 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-500">
                No checks match the current filters.
              </div>
            )}

            {filteredChecks.length > pageSize && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                    Previous
                  </Button>
                  <Button variant="secondary" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
