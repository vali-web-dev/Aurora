import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathArray = params.path || [];
    const filePath = pathArray.join('/');

    // Security: prevent directory traversal
    if (filePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Try to read as markdown file
    let fullPath = join(process.cwd(), 'docs', `${filePath}.md`);
    
    try {
      const content = await readFile(fullPath, 'utf-8');
      return NextResponse.json({
        success: true,
        content,
        path: filePath,
      });
    } catch {
      // If .md file doesn't exist, try index.md
      fullPath = join(process.cwd(), 'docs', filePath, 'index.md');
      const content = await readFile(fullPath, 'utf-8');
      return NextResponse.json({
        success: true,
        content,
        path: filePath,
      });
    }
  } catch (error) {
    console.error('Docs API error:', error);
    return NextResponse.json(
      { error: 'Documentation file not found' },
      { status: 404 }
    );
  }
}
