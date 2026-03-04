export type EditorRuntimeEventType =
  | 'action-success'
  | 'action-failure'
  | 'import-success'
  | 'import-failure'
  | 'circuit-blocked'
  | 'retry-used';

export interface EditorRuntimeEvent {
  type: EditorRuntimeEventType;
  operation: string;
  timestamp: string;
  message?: string;
  attempts?: number;
  circuit?: 'action' | 'import';
}

export interface EditorRuntimeSummary {
  totalEvents: number;
  actionSuccesses: number;
  actionFailures: number;
  importSuccesses: number;
  importFailures: number;
  circuitBlocked: number;
  retriesUsed: number;
  errorRatePercent: number;
  lastEventAt: string | null;
}

const MAX_EVENTS = 600;

const runtimeBuffer: EditorRuntimeEvent[] = [];

export function appendEditorRuntimeEvent(event: EditorRuntimeEvent) {
  runtimeBuffer.push(event);
  if (runtimeBuffer.length > MAX_EVENTS) {
    runtimeBuffer.splice(0, runtimeBuffer.length - MAX_EVENTS);
  }
}

export function getRecentEditorRuntimeEvents(limit = 50): EditorRuntimeEvent[] {
  return runtimeBuffer.slice(Math.max(0, runtimeBuffer.length - Math.max(1, limit)));
}

export function summarizeEditorRuntimeEvents(events: EditorRuntimeEvent[]): EditorRuntimeSummary {
  const actionSuccesses = events.filter((event) => event.type === 'action-success').length;
  const actionFailures = events.filter((event) => event.type === 'action-failure').length;
  const importSuccesses = events.filter((event) => event.type === 'import-success').length;
  const importFailures = events.filter((event) => event.type === 'import-failure').length;
  const circuitBlocked = events.filter((event) => event.type === 'circuit-blocked').length;
  const retriesUsed = events
    .filter((event) => event.type === 'retry-used')
    .reduce((sum, event) => sum + Math.max(0, (event.attempts ?? 1) - 1), 0);

  const totalOps = actionSuccesses + actionFailures + importSuccesses + importFailures;
  const totalFailures = actionFailures + importFailures;
  const errorRatePercent = totalOps > 0 ? Number(((totalFailures / totalOps) * 100).toFixed(2)) : 0;

  return {
    totalEvents: events.length,
    actionSuccesses,
    actionFailures,
    importSuccesses,
    importFailures,
    circuitBlocked,
    retriesUsed,
    errorRatePercent,
    lastEventAt: events.length > 0 ? events[events.length - 1]?.timestamp ?? null : null,
  };
}

export function getEditorRuntimeSummary(): EditorRuntimeSummary {
  return summarizeEditorRuntimeEvents(runtimeBuffer);
}
