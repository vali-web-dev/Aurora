import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const allowedTypes = new Set(['api', 'platform']);

export async function GET(request: Request, { params }: { params: { type: string } }) {
  const type = params.type;
  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: 'Invalid diagnostics type' }, { status: 400 });
  }

  try {
    const historyDir = path.join(process.cwd(), '.aurora', `${type}-diag-history`);
    const latestFile = path.join(historyDir, 'latest.json');
    if (!fs.existsSync(latestFile)) {
      return NextResponse.json({ error: 'No diagnostics data found' }, { status: 404 });
    }

    const payload = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read diagnostics data' }, { status: 500 });
  }
}
