/**
 * Aurora Health Check Endpoint
 * GET /api/health
 * 
 * Returns overall system health status
 */

import { NextResponse } from 'next/server';
import { runHealthChecks } from '@/lib/health';

export async function GET() {
  try {
    const healthCheck = await runHealthChecks();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : healthCheck.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
