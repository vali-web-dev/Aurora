import { NextResponse } from 'next/server';
import { checkDatabase } from '@/lib/health';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health/db
 * Check database connectivity and health status
 */
export async function GET() {
  try {
    const dbCheck = await checkDatabase();

    if (dbCheck.status === 'pass') {
      return NextResponse.json(
        {
          status: 'healthy',
          database: 'connected',
          responseTime: dbCheck.responseTime,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'failed',
          message: dbCheck.message,
          responseTime: dbCheck.responseTime,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
