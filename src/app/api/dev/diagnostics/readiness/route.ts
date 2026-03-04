import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'artifacts', 'release-readiness.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'No readiness data found' }, { status: 404 });
    }
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read readiness data' }, { status: 500 });
  }
}
