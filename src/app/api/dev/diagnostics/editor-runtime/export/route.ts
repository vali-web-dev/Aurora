import { NextRequest, NextResponse } from 'next/server';
import { getRecentEditorRuntimeEvents, summarizeEditorRuntimeEvents } from '@/lib/editor/runtimeDiagnosticsStore';
import { readPersistedEditorRuntimeEvents } from '@/lib/editor/runtimeDiagnosticsPersistence';
import {
  buildHourlyTrend,
  computeRuntimeAlerts,
  computeRuntimeWindows,
  mergeEvents,
  resolveRuntimeThresholds,
  runtimeHealthStatus,
  type RuntimeThresholdProfile,
} from '@/lib/editor/runtimeDiagnosticsAnalysis';

export async function GET(request: NextRequest) {
  const requestedProfile = (request.nextUrl.searchParams.get('profile') || 'balanced').toLowerCase();
  const profile: RuntimeThresholdProfile =
    requestedProfile === 'strict' || requestedProfile === 'lenient' ? requestedProfile : 'balanced';
  const thresholds = resolveRuntimeThresholds(profile);

  const allEvents = mergeEvents(getRecentEditorRuntimeEvents(600), readPersistedEditorRuntimeEvents());
  const summary = summarizeEditorRuntimeEvents(allEvents);
  const windows = computeRuntimeWindows(allEvents);
  const alerts = computeRuntimeAlerts(windows, thresholds);
  const status = runtimeHealthStatus(alerts);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    source: 'editor-runtime-diagnostics',
    profile,
    status,
    thresholds,
    summary,
    windows,
    alerts,
    trend: {
      hourly24h: buildHourlyTrend(allEvents, 24),
    },
  });
}
