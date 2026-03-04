import type { EditorRuntimeEvent, EditorRuntimeSummary } from './runtimeDiagnosticsStore';
import { summarizeEditorRuntimeEvents } from './runtimeDiagnosticsStore';

export interface RuntimeThresholds {
  oneHourErrorRatePercent: number;
  oneHourCircuitBlocked: number;
  twentyFourHourErrorRatePercent: number;
  twentyFourHourRetriesUsed: number;
}

export type RuntimeThresholdProfile = 'strict' | 'balanced' | 'lenient';

export interface RuntimeAlert {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
}

export interface RuntimeWindows {
  oneHour: EditorRuntimeSummary;
  twentyFourHours: EditorRuntimeSummary;
}

export function mergeEvents(memoryEvents: EditorRuntimeEvent[], persistedEvents: EditorRuntimeEvent[]) {
  const map = new Map<string, EditorRuntimeEvent>();
  for (const event of [...persistedEvents, ...memoryEvents]) {
    const key = `${event.timestamp}|${event.type}|${event.operation}|${event.circuit ?? '-'}|${event.message ?? '-'}|${event.attempts ?? 0}`;
    map.set(key, event);
  }

  return [...map.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function filterEventsWithin(events: EditorRuntimeEvent[], fromEpochMs: number) {
  return events.filter((event) => {
    const at = Date.parse(event.timestamp);
    return Number.isFinite(at) && at >= fromEpochMs;
  });
}

export function buildHourlyTrend(events: EditorRuntimeEvent[], hours = 24) {
  const now = Date.now();
  const bucketMs = 60 * 60 * 1000;
  const points: Array<{ bucketStart: string; totalOps: number; failures: number; errorRatePercent: number; circuitBlocked: number }> = [];

  for (let i = hours - 1; i >= 0; i -= 1) {
    const start = new Date(Math.floor((now - i * bucketMs) / bucketMs) * bucketMs).getTime();
    const end = start + bucketMs;
    const bucketEvents = events.filter((event) => {
      const ts = Date.parse(event.timestamp);
      return Number.isFinite(ts) && ts >= start && ts < end;
    });

    const summary = summarizeEditorRuntimeEvents(bucketEvents);
    const totalOps = summary.actionSuccesses + summary.actionFailures + summary.importSuccesses + summary.importFailures;
    const failures = summary.actionFailures + summary.importFailures;

    points.push({
      bucketStart: new Date(start).toISOString(),
      totalOps,
      failures,
      errorRatePercent: summary.errorRatePercent,
      circuitBlocked: summary.circuitBlocked,
    });
  }

  return points;
}

export function computeRuntimeWindows(allEvents: EditorRuntimeEvent[]): RuntimeWindows {
  const now = Date.now();
  const oneHourEvents = filterEventsWithin(allEvents, now - 60 * 60 * 1000);
  const dayEvents = filterEventsWithin(allEvents, now - 24 * 60 * 60 * 1000);

  return {
    oneHour: summarizeEditorRuntimeEvents(oneHourEvents),
    twentyFourHours: summarizeEditorRuntimeEvents(dayEvents),
  };
}

export function computeRuntimeAlerts(windows: RuntimeWindows, thresholds: RuntimeThresholds): RuntimeAlert[] {
  const alerts: RuntimeAlert[] = [];

  if (windows.oneHour.errorRatePercent > thresholds.oneHourErrorRatePercent) {
    alerts.push({
      id: 'one-hour-error-rate',
      severity: windows.oneHour.errorRatePercent > thresholds.oneHourErrorRatePercent * 2 ? 'critical' : 'warning',
      message: `1h error rate ${windows.oneHour.errorRatePercent}% exceeds threshold ${thresholds.oneHourErrorRatePercent}%.`,
    });
  }

  if (windows.oneHour.circuitBlocked > thresholds.oneHourCircuitBlocked) {
    alerts.push({
      id: 'one-hour-circuit-blocked',
      severity: 'critical',
      message: `1h circuit blocks ${windows.oneHour.circuitBlocked} exceed threshold ${thresholds.oneHourCircuitBlocked}.`,
    });
  }

  if (windows.twentyFourHours.errorRatePercent > thresholds.twentyFourHourErrorRatePercent) {
    alerts.push({
      id: 'twenty-four-hour-error-rate',
      severity: 'warning',
      message: `24h error rate ${windows.twentyFourHours.errorRatePercent}% exceeds threshold ${thresholds.twentyFourHourErrorRatePercent}%.`,
    });
  }

  if (windows.twentyFourHours.retriesUsed > thresholds.twentyFourHourRetriesUsed) {
    alerts.push({
      id: 'twenty-four-hour-retries',
      severity: 'warning',
      message: `24h retries ${windows.twentyFourHours.retriesUsed} exceed threshold ${thresholds.twentyFourHourRetriesUsed}.`,
    });
  }

  return alerts;
}

export function runtimeHealthStatus(alerts: RuntimeAlert[]): 'pass' | 'warn' | 'fail' {
  if (alerts.some((alert) => alert.severity === 'critical')) return 'fail';
  if (alerts.length > 0) return 'warn';
  return 'pass';
}

export function resolveRuntimeThresholds(profile: RuntimeThresholdProfile): RuntimeThresholds {
  const table: Record<RuntimeThresholdProfile, RuntimeThresholds> = {
    strict: {
      oneHourErrorRatePercent: 1,
      oneHourCircuitBlocked: 0,
      twentyFourHourErrorRatePercent: 2,
      twentyFourHourRetriesUsed: 10,
    },
    balanced: {
      oneHourErrorRatePercent: 2,
      oneHourCircuitBlocked: 1,
      twentyFourHourErrorRatePercent: 3,
      twentyFourHourRetriesUsed: 20,
    },
    lenient: {
      oneHourErrorRatePercent: 4,
      oneHourCircuitBlocked: 2,
      twentyFourHourErrorRatePercent: 5,
      twentyFourHourRetriesUsed: 40,
    },
  };

  return table[profile];
}
