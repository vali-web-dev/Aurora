import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function readHistory(historyType: string, limit: number) {
  try {
    const historyDir = path.join(process.cwd(), '.aurora', `${historyType}-diag-history`);
    if (!fs.existsSync(historyDir)) return [];

    const files = fs
      .readdirSync(historyDir)
      .filter((name) => /^api-diag-.*\.json$|^platform-diag-.*\.json$/.test(name))
      .sort((a, b) => a.localeCompare(b))
      .slice(-limit)
      .map((name) => path.join(historyDir, name));

    return files
      .map((filePath) => {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          return {
            timestamp: data.timestamp,
            ok: data.ok,
            totals: data.totals,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number(searchParams.get('limit') || '12');
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 3), 50) : 12;
  const items = readHistory(params.type, safeLimit);
  const failures = items.map((item) => item.totals?.failed || 0);
  const mean = failures.length ? failures.reduce((sum, val) => sum + val, 0) / failures.length : 0;
  const variance = failures.length
    ? failures.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / failures.length
    : 0;
  const std = Math.sqrt(variance);
  const low = Math.max(0, Math.round(mean - std));
  const high = Math.round(mean + std);
  return NextResponse.json({
    items,
    stats: {
      mean,
      std,
      low,
      high,
      samples: failures.length,
    },
  });
}
