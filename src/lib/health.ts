/**
 * Aurora Health Check and Monitoring Utilities
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'warn' | 'fail';
      message?: string;
      responseTime?: number;
    };
  };
}

/**
 * Check database connectivity
 */
export async function checkDatabase(): Promise<{ status: 'pass' | 'fail'; responseTime: number; message?: string }> {
  const start = Date.now();
  
  try {
    await db.execute(sql`SELECT 1`);
    const responseTime = Date.now() - start;
    
    return {
      status: 'pass',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    
    return {
      status: 'fail',
      responseTime,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Check environment configuration
 */
export function checkEnvironment(): { status: 'pass' | 'warn' | 'fail'; message?: string } {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    return {
      status: 'fail',
      message: `Missing required environment variables: ${missing.join(', ')}`,
    };
  }
  
  // Check if using default/weak secrets
  if (process.env.NEXTAUTH_SECRET === 'your-secret-key-here-generate-with-openssl-rand-base64-32') {
    return {
      status: 'warn',
      message: 'Using default NEXTAUTH_SECRET. Generate a strong secret for production.',
    };
  }
  
  return { status: 'pass' };
}

/**
 * Check system resources (basic)
 */
export function checkSystem(): { status: 'pass' | 'warn' | 'fail'; memory?: any; uptime?: number } {
  const memUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };
  
  const uptime = Math.round(process.uptime());
  
  // Warn if heap usage is above 80%
  const heapUsagePercent = (memoryMB.heapUsed / memoryMB.heapTotal) * 100;
  
  return {
    status: heapUsagePercent > 80 ? 'warn' : 'pass',
    memory: memoryMB,
    uptime,
  };
}

/**
 * Run all health checks
 */
export async function runHealthChecks(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  
  // Run checks in parallel
  const [dbCheck, envCheck, sysCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkEnvironment()),
    Promise.resolve(checkSystem()),
  ]);
  
  const checks = {
    database: dbCheck,
    environment: envCheck,
    system: sysCheck,
  };
  
  // Determine overall status
  const hasFailure = Object.values(checks).some(check => check.status === 'fail');
  const hasWarning = Object.values(checks).some(check => check.status === 'warn');
  
  const status = hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy';
  
  return {
    status,
    timestamp,
    checks,
  };
}

/**
 * Metrics collection for monitoring
 */
export interface Metrics {
  requestCount: number;
  errorCount: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
}

class MetricsCollector {
  private requests: number[] = [];
  private errors: number = 0;
  private readonly maxSamples = 1000;

  recordRequest(durationMs: number) {
    this.requests.push(durationMs);
    
    // Keep only recent samples
    if (this.requests.length > this.maxSamples) {
      this.requests.shift();
    }
  }

  recordError() {
    this.errors++;
  }

  getMetrics(): Metrics {
    if (this.requests.length === 0) {
      return {
        requestCount: 0,
        errorCount: this.errors,
        latency: { p50: 0, p95: 0, p99: 0 },
      };
    }

    const sorted = [...this.requests].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    return {
      requestCount: this.requests.length,
      errorCount: this.errors,
      latency: {
        p50: sorted[p50Index],
        p95: sorted[p95Index],
        p99: sorted[p99Index],
      },
    };
  }

  reset() {
    this.requests = [];
    this.errors = 0;
  }
}

export const metrics = new MetricsCollector();

/**
 * Request timing middleware
 */
export function withTiming<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  
  return fn()
    .then(result => {
      const duration = Date.now() - start;
      metrics.recordRequest(duration);
      return { result, duration };
    })
    .catch(error => {
      const duration = Date.now() - start;
      metrics.recordRequest(duration);
      metrics.recordError();
      throw error;
    });
}

export default {
  runHealthChecks,
  checkDatabase,
  checkEnvironment,
  checkSystem,
  metrics,
  withTiming,
};
