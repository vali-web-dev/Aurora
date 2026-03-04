import fs from 'fs/promises';
import path from 'path';
import { readPersistedEditorRuntimeEvents } from '../src/lib/editor/runtimeDiagnosticsPersistence';
import {
  buildHourlyTrend,
  computeRuntimeAlerts,
  computeRuntimeWindows,
  mergeEvents,
  resolveRuntimeThresholds,
  runtimeHealthStatus,
  type RuntimeThresholdProfile,
} from '../src/lib/editor/runtimeDiagnosticsAnalysis';
import { summarizeEditorRuntimeEvents } from '../src/lib/editor/runtimeDiagnosticsStore';

interface SnapshotPayload {
  generatedAt: string;
  source: 'editor-runtime-diagnostics';
  profile: RuntimeThresholdProfile;
  status: 'pass' | 'warn' | 'fail';
  thresholds: ReturnType<typeof resolveRuntimeThresholds>;
  summary: ReturnType<typeof summarizeEditorRuntimeEvents>;
  windows: ReturnType<typeof computeRuntimeWindows>;
  alerts: ReturnType<typeof computeRuntimeAlerts>;
  trend: {
    hourly24h: ReturnType<typeof buildHourlyTrend>;
  };
}

function parseProfileArg(): RuntimeThresholdProfile {
  const direct = process.argv.find((arg) => arg.startsWith('--profile='));
  const flagIndex = process.argv.findIndex((arg) => arg === '--profile');
  const raw = (direct ? direct.split('=')[1] : flagIndex >= 0 ? process.argv[flagIndex + 1] : 'balanced') ?? 'balanced';
  const normalized = raw.toLowerCase();
  if (normalized === 'strict' || normalized === 'lenient') return normalized;
  return 'balanced';
}

function parseOutArg(): string {
  const direct = process.argv.find((arg) => arg.startsWith('--out='));
  const flagIndex = process.argv.findIndex((arg) => arg === '--out');
  const raw = (direct ? direct.split('=')[1] : flagIndex >= 0 ? process.argv[flagIndex + 1] : 'artifacts/editor-runtime-ci-export.json') ?? 'artifacts/editor-runtime-ci-export.json';
  return raw;
}

async function readHistoryFile(filePath: string): Promise<SnapshotPayload[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson(filePath: string, payload: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}

async function run() {
  const profile = parseProfileArg();
  const outRelative = parseOutArg();
  const outPath = path.resolve(process.cwd(), outRelative);
  const historyPath = path.resolve(process.cwd(), 'artifacts/editor-runtime-ci-history.json');

  const persistedEvents = readPersistedEditorRuntimeEvents();
  const allEvents = mergeEvents([], persistedEvents);
  const thresholds = resolveRuntimeThresholds(profile);
  const windows = computeRuntimeWindows(allEvents);
  const summary = summarizeEditorRuntimeEvents(allEvents);
  const alerts = computeRuntimeAlerts(windows, thresholds);
  const status = runtimeHealthStatus(alerts);

  const payload: SnapshotPayload = {
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
  };

  await writeJson(outPath, payload);

  const history = await readHistoryFile(historyPath);
  const nextHistory = [...history, payload].slice(-500);
  await writeJson(historyPath, nextHistory);

  console.log(`Editor runtime snapshot written: ${path.relative(process.cwd(), outPath)}`);
  console.log(`Status=${status} alerts=${alerts.length} profile=${profile}`);
}

run().catch((error) => {
  console.error('Editor runtime snapshot failed:', error);
  process.exit(1);
});
