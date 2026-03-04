import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'artifacts', 'api-diagnostics.compare.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'No compare data found' }, { status: 404 });
    }
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read compare data' }, { status: 500 });
  }
}
