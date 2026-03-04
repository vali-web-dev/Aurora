import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'artifacts', 'api-diagnostics.compare-history.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ items: [] });
    }
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read compare history data' }, { status: 500 });
  }
}
