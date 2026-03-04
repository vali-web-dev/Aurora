import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'artifacts', 'diagnostics-alerts.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ updatedAt: null, jobs: {} });
    }
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read alerts data' }, { status: 500 });
  }
}
