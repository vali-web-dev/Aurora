import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getLatestDiagnostics(historyType: string) {
  try {
    const historyDir = path.join(process.cwd(), '.aurora', `${historyType}-diag-history`);
    const latestFile = path.join(historyDir, 'latest.json');

    if (!fs.existsSync(latestFile)) {
      return null;
    }

    const content = fs.readFileSync(latestFile, 'utf-8');
    const data = JSON.parse(content);

    return {
      timestamp: data.timestamp || new Date().toISOString(),
      type: historyType,
      ok: data.ok || false,
      totals: data.totals || { passed: 0, failed: 0, skipped: 0, durationMs: 0 },
      diff: data.diff || null,
      universeCoverage: data.universeCoverage || null,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'api';

  try {
    const latest = getLatestDiagnostics(type);
    if (!latest) {
      return NextResponse.json({ error: 'No diagnostics data found' }, { status: 404 });
    }
    return NextResponse.json(latest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch diagnostics' }, { status: 500 });
  }
}
