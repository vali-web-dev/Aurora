import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health/db
 * Check database connectivity and health status
 * Note: Dynamic route to prevent build-time execution
 */
export async function GET() {
  try {
    // Only import at runtime to avoid build-time errors
    const { checkDbHealth } = await import('@/lib/db');
    const isHealthy = await checkDbHealth();

    if (isHealthy) {
      return NextResponse.json(
        {
          status: 'ok',
          database: 'connected',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 'error',
          database: 'unhealthy',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
