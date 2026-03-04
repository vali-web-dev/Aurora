import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { auth } from '@/lib/auth';

const exportRunHistoryFile = path.join(process.cwd(), 'artifacts', 'scheduler-export-runs.json');

type ExportRunRecord = {
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
};

function createExportRunId() {
  return `export-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readExportRunHistory(): ExportRunRecord[] {
  try {
    if (!fs.existsSync(exportRunHistoryFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(exportRunHistoryFile, 'utf-8')) as unknown;
    return Array.isArray(parsed) ? (parsed as ExportRunRecord[]) : [];
  } catch {
    return [];
  }
}

function appendExportRunHistory(record: ExportRunRecord) {
  const existing = readExportRunHistory();
  const next = [...existing, record].slice(-300);
  fs.mkdirSync(path.dirname(exportRunHistoryFile), { recursive: true });
  fs.writeFileSync(exportRunHistoryFile, JSON.stringify(next, null, 2), 'utf-8');
}

export async function GET() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });
  }

  const items = readExportRunHistory()
    .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt))
    .slice(0, 40);

  return NextResponse.json({
    items,
    total: items.length,
    generatedAt: new Date().toISOString(),
  });
}

function getAdminAllowlist(): string[] {
  const multi = (process.env.AURORA_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const singleCandidates = [process.env.AURORA_ADMIN_EMAIL, process.env.ADMIN_EMAIL]
    .map((value) => (value || '').trim().toLowerCase())
    .filter(Boolean);
  const defaults = process.env.NODE_ENV === 'development' ? ['aurora@example.com'] : [];

  return Array.from(new Set([...multi, ...singleCandidates, ...defaults]));
}

async function requireAdminUser() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!session?.user?.id || !email) {
    return { ok: false as const, status: 401, message: 'Unauthorized' };
  }

  const allowlist = getAdminAllowlist();
  if (!allowlist.includes(email)) {
    return { ok: false as const, status: 403, message: 'Forbidden: admin access required' };
  }

  return { ok: true as const, userId: session.user.id, email };
}

function runExportSnapshot(): Promise<{ exitCode: number; outputTail: string[] }> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'scheduler-export-snapshot.ts');
    const child = spawn(process.execPath, ['--import', 'tsx', scriptPath], {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
    });

    let output = '';
    const timeout = setTimeout(() => {
      output += '\n[EXPORT] Timeout reached; process terminated.';
      child.kill('SIGTERM');
    }, 5 * 60 * 1000);

    child.stdout.on('data', (chunk) => {
      output += String(chunk);
    });

    child.stderr.on('data', (chunk) => {
      output += String(chunk);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      const lines = output
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

      resolve({
        exitCode: code ?? 1,
        outputTail: lines.slice(-80),
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        exitCode: 1,
        outputTail: [`Failed to start export snapshot script: ${error.message}`],
      });
    });
  });
}

export async function POST() {
  const adminCheck = await requireAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });
  }

  const startedAt = new Date().toISOString();
  const result = await runExportSnapshot();
  const finishedAt = new Date().toISOString();
  const durationMs = Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt));

  const record: ExportRunRecord = {
    id: createExportRunId(),
    ok: result.exitCode === 0,
    exitCode: result.exitCode,
    durationMs,
    startedAt,
    finishedAt,
    message: result.exitCode === 0
      ? 'Scheduler export snapshot completed successfully.'
      : `Scheduler export snapshot failed (exit ${result.exitCode}).`,
    outputTail: result.outputTail,
    actor: {
      userId: adminCheck.userId,
      email: adminCheck.email,
    },
  };

  appendExportRunHistory(record);

  return NextResponse.json({
    ...record,
  });
}
