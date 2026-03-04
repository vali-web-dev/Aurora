import fs from 'fs';
import path from 'path';
import type { EditorRuntimeEvent } from './runtimeDiagnosticsStore';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const HISTORY_FILE = path.join(ARTIFACTS_DIR, 'editor-runtime-diagnostics.history.json');
const MAX_PERSISTED_EVENTS = 6000;

interface PersistedHistory {
  updatedAt: string;
  events: EditorRuntimeEvent[];
}

function ensureArtifactsDir() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }
}

function sanitizeEvent(event: EditorRuntimeEvent): EditorRuntimeEvent {
  return {
    type: event.type,
    operation: event.operation,
    timestamp: event.timestamp,
    message: event.message,
    attempts: event.attempts,
    circuit: event.circuit,
  };
}

function readRawHistory(): PersistedHistory {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return { updatedAt: new Date().toISOString(), events: [] };
    }

    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')) as Partial<PersistedHistory>;
    const events = Array.isArray(parsed.events)
      ? parsed.events
          .map((event) => {
            if (!event || typeof event !== 'object') return null;
            if (typeof event.type !== 'string' || typeof event.operation !== 'string') return null;
            return sanitizeEvent({
              type: event.type as EditorRuntimeEvent['type'],
              operation: event.operation,
              timestamp: typeof event.timestamp === 'string' ? event.timestamp : new Date().toISOString(),
              message: typeof event.message === 'string' ? event.message : undefined,
              attempts: typeof event.attempts === 'number' ? event.attempts : undefined,
              circuit: event.circuit === 'action' || event.circuit === 'import' ? event.circuit : undefined,
            });
          })
          .filter((event): event is EditorRuntimeEvent => Boolean(event))
      : [];

    return {
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      events,
    };
  } catch {
    return { updatedAt: new Date().toISOString(), events: [] };
  }
}

function writeRawHistory(history: PersistedHistory) {
  ensureArtifactsDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

export function readPersistedEditorRuntimeEvents(): EditorRuntimeEvent[] {
  return readRawHistory().events;
}

export function appendPersistedEditorRuntimeEvent(event: EditorRuntimeEvent) {
  const history = readRawHistory();
  const nextEvents = [...history.events, sanitizeEvent(event)].slice(-MAX_PERSISTED_EVENTS);
  writeRawHistory({
    updatedAt: new Date().toISOString(),
    events: nextEvents,
  });
}

export function getEditorRuntimeHistoryFilePath() {
  return HISTORY_FILE;
}
