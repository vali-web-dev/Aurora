import { NextRequest, NextResponse } from 'next/server';
import {
  appendEditorRuntimeEvent,
  getRecentEditorRuntimeEvents,
  summarizeEditorRuntimeEvents,
  type EditorRuntimeEvent,
  type EditorRuntimeEventType,
} from '@/lib/editor/runtimeDiagnosticsStore';
import {
  appendPersistedEditorRuntimeEvent,
  getEditorRuntimeHistoryFilePath,
  readPersistedEditorRuntimeEvents,
} from '@/lib/editor/runtimeDiagnosticsPersistence';
import {
  buildHourlyTrend,
  computeRuntimeAlerts,
  computeRuntimeWindows,
  mergeEvents,
  type RuntimeThresholds,
} from '@/lib/editor/runtimeDiagnosticsAnalysis';

const validTypes = new Set<EditorRuntimeEventType>([
  'action-success',
  'action-failure',
  'import-success',
  'import-failure',
  'circuit-blocked',
  'retry-used',
]);

function isEventType(value: unknown): value is EditorRuntimeEventType {
  return typeof value === 'string' && validTypes.has(value as EditorRuntimeEventType);
}

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 40;
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 40;
  const thresholds: RuntimeThresholds = {
    oneHourErrorRatePercent: Number(request.nextUrl.searchParams.get('threshold1hError') ?? '2'),
    oneHourCircuitBlocked: Number(request.nextUrl.searchParams.get('threshold1hCircuit') ?? '1'),
    twentyFourHourErrorRatePercent: Number(request.nextUrl.searchParams.get('threshold24hError') ?? '3'),
    twentyFourHourRetriesUsed: Number(request.nextUrl.searchParams.get('threshold24hRetries') ?? '20'),
  };

  const memoryEvents = getRecentEditorRuntimeEvents(600);
  const persistedEvents = readPersistedEditorRuntimeEvents();
  const allEvents = mergeEvents(memoryEvents, persistedEvents);
  const recentEvents = allEvents.slice(Math.max(0, allEvents.length - safeLimit));

  const summary = summarizeEditorRuntimeEvents(allEvents);
  const windows = computeRuntimeWindows(allEvents);
  const hourlyTrend = buildHourlyTrend(allEvents, 24);
  const alerts = computeRuntimeAlerts(windows, thresholds);

  return NextResponse.json({
    summary,
    windows,
    alerts,
    thresholds,
    trend: {
      hourly24h: hourlyTrend,
    },
    events: recentEvents,
    persisted: {
      historyFile: getEditorRuntimeHistoryFilePath(),
      persistedEvents: persistedEvents.length,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<EditorRuntimeEvent>;

    if (!isEventType(body.type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const event: EditorRuntimeEvent = {
      type: body.type,
      operation: typeof body.operation === 'string' ? body.operation : 'unknown',
      timestamp: typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString(),
      message: typeof body.message === 'string' ? body.message : undefined,
      attempts: typeof body.attempts === 'number' ? body.attempts : undefined,
      circuit: body.circuit === 'action' || body.circuit === 'import' ? body.circuit : undefined,
    };

    appendEditorRuntimeEvent(event);
    appendPersistedEditorRuntimeEvent(event);

    const combinedSummary = summarizeEditorRuntimeEvents(
      mergeEvents(getRecentEditorRuntimeEvents(600), readPersistedEditorRuntimeEvents())
    );

    return NextResponse.json({ ok: true, summary: combinedSummary });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
