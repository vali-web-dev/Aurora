# Aurora Monitoring & Observability Setup

**Status**: Phase 9 - Production Monitoring  
**Last Updated**: February 23, 2026  
**Scope**: APM, Error Tracking, Logging, Alerting  

---

## 📊 Overview

This guide implements comprehensive monitoring across:
1. **Application Performance Monitoring (APM)** — Datadog/New Relic
2. **Error Tracking** — Sentry integration
3. **Logging** — Centralized log aggregation
4. **Alerting** — PagerDuty/ops escalation
5. **Custom Metrics** — Business KPIs tracking

---

## 🚀 Quick Setup

### Install Monitoring SDKs

```bash
npm install \
  @sentry/nextjs \
  @sentry/tracing \
  winston \
  winston-loki \
  datadog-browser-rum \
  datadog-browser-logs
```

---

## 🔴 Sentry Error Tracking

### Initialize Sentry

Create `src/lib/monitoring/sentry.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  Sentry.init({
    // Production settings
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Capture breadcrumbs
    maxBreadcrumbs: 50,
    
    // Before send: filter sensitive data
    beforeSend(event, hint) {
      // Remove PII
      if (event.request) {
        delete event.request.headers;
        delete event.request.cookies;
      }
      
      if (event.request?.url?.includes('password')) {
        return null; // Don't send
      }
      
      return event;
    },

    // Integrations
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Capture replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
```

### API Error Handling

Create `src/lib/monitoring/api-errors.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

interface ApiErrorOptions {
  status?: number;
  message?: string;
  code?: string;
  context?: Record<string, any>;
}

export class ApiError extends Error {
  constructor(
    public status: number = 500,
    public code: string = 'INTERNAL_ERROR',
    message: string = 'Internal Server Error',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Error Handler with Sentry Logging
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  options: ApiErrorOptions = {}
) {
  const status = options.status || 500;
  const message = options.message || 'Internal Server Error';
  const code = options.code || 'UNKNOWN_ERROR';

  // Determine if error is client or server error
  const isClientError = status >= 400 && status < 500;

  // Capture in Sentry (but not client errors unless notable)
  if (!isClientError) {
    Sentry.captureException(error, {
      tags: {
        errorCode: code,
        endpoint: request.nextUrl.pathname,
        method: request.method,
      },
      contexts: {
        api: {
          url: request.nextUrl.href,
          method: request.method,
          ...options.context,
        },
      },
    });
  }

  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
    },
    { status }
  );
}

/**
 * API Middleware: Wrap handlers for monitoring
 */
export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const startTime = performance.now();

    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;

      // Log successful requests
      Sentry.captureMessage(`${req.method} ${req.nextUrl.pathname} ${response.status}`, 'info');

      // Track performance metric
      Sentry.captureMessage(`API Duration: ${duration}ms`, 'info', {
        tags: {
          duration: Math.round(duration),
          endpoint: req.nextUrl.pathname,
          status: response.status,
        },
      });

      return response;
    } catch (error) {
      return handleApiError(error, req, { status: 500 });
    }
  };
}
```

### Use in API Routes

```typescript
import { withMonitoring } from '@/lib/monitoring/api-errors';

export const GET = withMonitoring(async (req) => {
  // Your handler
});
```

---

## 📝 Centralized Logging

### Winston Logger Setup

Create `src/lib/monitoring/logger.ts`:

```typescript
import winston from 'winston';
import LokiTransport from 'winston-loki';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'aurora',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
        )
      ),
    }),

    // File logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    new winston.transports.File({
      filename: 'logs/combined.log',
    }),

    // Loki (production)
    ...(isProduction && process.env.LOKI_URL
      ? [
          new LokiTransport({
            host: process.env.LOKI_URL,
            labels: {
              service: 'aurora',
              environment: 'production',
            },
          }),
        ]
      : []),
  ],
});

// Usage
export function logApiCall(
  method: string,
  path: string,
  status: number,
  duration: number,
  userId?: string
) {
  logger.info('API Call', {
    method,
    path,
    status,
    duration,
    userId,
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error('Unexpected Error', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}
```

### Add to API Routes

```typescript
import { logger, logApiCall } from '@/lib/monitoring/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const response = await fetchData();
    const duration = Date.now() - startTime;
    
    logApiCall('GET', req.nextUrl.pathname, 200, duration, userId);
    
    return NextResponse.json(response);
  } catch (error) {
    logError(error as Error, { endpoint: req.nextUrl.pathname });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 📊 Datadog Browser RUM

### Initialize in Client

Create `src/lib/monitoring/datadog-rum.ts`:

```typescript
import { datadogRum } from '@datadog/browser-rum';

export function initDatadogRum() {
  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DD_APP_ID,
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'aurora-web',
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,

    // Session sampling
    sessionSampleRate: process.env.NODE_ENV === 'production' ? 10 : 100,
    sessionReplaySampleRate: process.env.NODE_ENV === 'production' ? 5 : 100,

    // Track resources
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',

    // Allow URLs
    allowedTracingUrls: [
      /https:\/\/.*\.aurora\.com/,
      /https:\/\/api\.aurora\.com/,
    ],
  });

  datadogRum.startSessionReplayRecording();
}

export function trackUserAction(name: string, context?: Record<string, any>) {
  datadogRum.addUserAction(name, { ...context });
}

export function trackError(error: Error, context?: Record<string, any>) {
  datadogRum.addError({
    error,
    context,
  });
}
```

---

## ⚙️ Custom Business Metrics

Create `src/lib/monitoring/business-metrics.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

interface BusinessMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

class BusinessMetricsCollector {
  private metrics: BusinessMetric[] = [];

  // Commerce metrics
  trackOrderCreated(orderId: string, total: number, userId: string) {
    this.track('order.created', total / 100, {
      orderId,
      userId,
    });
  }

  trackPaymentSuccess(amount: number, provider: string, userId: string) {
    this.track('payment.success', amount / 100, {
      provider,
      userId,
    });
  }

  trackPaymentFailed(provider: string, reason: string) {
    this.track('payment.failed', 1, {
      provider,
      reason,
    });
  }

  trackCheckoutAbandoned(cartValue: number, userId: string) {
    this.track('checkout.abandoned', cartValue / 100, {
      userId,
    });
  }

  // User metrics
  trackUserSignup(userId: string) {
    this.track('user.signup', 1, { userId });
  }

  trackUserActive(userId: string) {
    this.track('user.active', 1, { userId, timestamp: new Date().toISOString() });
  }

  // Performance metrics
  trackApiCall(endpoint: string, duration: number, status: number) {
    this.track('api.response_time', duration, {
      endpoint,
      status: String(status),
    });
  }

  // Private methods
  private track(name: string, value: number, tags: Record<string, string>) {
    const metric: BusinessMetric = {
      name,
      value,
      tags,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Send to monitoring
    Sentry.captureMessage(`${name}: ${value}`, 'info', { tags });

    // Keep last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  clear() {
    this.metrics = [];
  }
}

export const businessMetrics = new BusinessMetricsCollector();
```

### Usage in Checkout

```typescript
import { businessMetrics } from '@/lib/monitoring/business-metrics';

async function handlePayment() {
  try {
    const result = await stripe.confirmPayment({ ... });
    
    businessMetrics.trackPaymentSuccess(amount, 'stripe', userId);
    businessMetrics.trackOrderCreated(orderId, amount, userId);
    
  } catch (error) {
    businessMetrics.trackPaymentFailed('stripe', error.message);
  }
}
```

---

## 🚨 Alerting Rules

### PagerDuty Integration

Create `src/lib/monitoring/alerting.ts`:

```typescript
import { logger } from './logger';

interface AlertCondition {
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  duration: number; // seconds
  severity: 'warning' | 'critical';
}

/**
 * Alert Rules
 */
export const ALERT_RULES = {
  highErrorRate: {
    threshold: 0.05, // 5%
    operator: 'gt' as const,
    duration: 300, // 5 minutes
    severity: 'critical' as const,
  },
  highLatency: {
    threshold: 1000, // 1s
    operator: 'gt' as const,
    duration: 600, // 10 minutes
    severity: 'warning' as const,
  },
  databaseDown: {
    threshold: 0,
    operator: 'eq' as const,
    duration: 60, // 1 minute
    severity: 'critical' as const,
  },
  lowCacheHitRatio: {
    threshold: 0.95,
    operator: 'lt' as const,
    duration: 300,
    severity: 'warning' as const,
  },
  paymentProcessingFailure: {
    threshold: 0.01, // 1%
    operator: 'gt' as const,
    duration: 300,
    severity: 'critical' as const,
  },
};

/**
 * Send Alert to PagerDuty
 */
export async function sendAlert(
  title: string,
  description: string,
  severity: 'warning' | 'critical',
  context?: Record<string, any>
) {
  if (!process.env.PAGERDUTY_KEY) {
    logger.warn('PagerDuty key not configured');
    return;
  }

  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: process.env.PAGERDUTY_KEY,
        event_action: severity === 'critical' ? 'trigger' : 'update',
        dedup_key: `aurora-${title.replace(/\s+/g, '-')}`,
        payload: {
          summary: title,
          severity,
          source: 'Aurora',
          custom_details: context,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      logger.error('Failed to send PagerDuty alert', {
        status: response.status,
        body: await response.text(),
      });
    }

    logger.info('Alert sent', { title, severity });
  } catch (error) {
    logger.error('Error sending alert', { error, title });
  }
}

/**
 * Monitor system health and trigger alerts
 */
export async function monitorSystemHealth() {
  setInterval(async () => {
    // Check error rate (mock implementation)
    const errorRate = 0.02; // Would be calculated from metrics
    if (errorRate > ALERT_RULES.highErrorRate.threshold) {
      await sendAlert(
        'High Error Rate Detected',
        `Error rate is ${(errorRate * 100).toFixed(2)}%`,
        'critical',
        { errorRate }
      );
    }

    // Check database connectivity (mock)
    const dbConnected = true;
    if (!dbConnected) {
      await sendAlert(
        'Database Connection Failed',
        'Unable to connect to primary database',
        'critical'
      );
    }
  }, 60000); // Check every minute
}
```

---

## 📈 Monitoring Dashboard

### Grafana Dashboard Config

```json
{
  "dashboard": {
    "title": "Aurora Production Monitoring",
    "panels": [
      {
        "title": "Error Rate (%)",
        "targets": [
          {
            "expr": "rate(errors_total[5m]) * 100"
          }
        ],
        "alert": {
          "name": "High Error Rate",
          "conditions": [
            {
              "evaluator": { "params": [5], "type": "gt" },
              "operator": { "type": "and" },
              "query": { "params": ["A", "5m", "now"] },
              "type": "query"
            }
          ]
        }
      },
      {
        "title": "P95 API Latency (ms)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, api_duration_ms)"
          }
        ]
      },
      {
        "title": "Payment Success Rate",
        "targets": [
          {
            "expr": "rate(payments_success_total[1h]) / rate(payments_total[1h])"
          }
        ]
      },
      {
        "title": "Cache Hit Ratio",
        "targets": [
          {
            "expr": "redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses)"
          }
        ]
      }
    ]
  }
}
```

---

## 📚 Environment Configuration

### `.env.monitoring`

```bash
# Sentry
SENTRY_DSN=https://[key]@sentry.io/[project-id]

# Datadog
NEXT_PUBLIC_DD_APP_ID=your-dd-app-id
NEXT_PUBLIC_DD_CLIENT_TOKEN=your-dd-client-token

# PagerDuty
PAGERDUTY_KEY=your-pagerduty-routing-key

# Loki (Grafana)
LOKI_URL=https://loki.internal.aurora.com

# Metrics
DD_METRICS_ENABLED=true
METRICS_FLUSH_INTERVAL=60000
```

---

## 🎯 Monitoring Checklist

- [ ] Sentry configured and logging errors
- [ ] Winston logger set up with file/Loki output
- [ ] Datadog RUM initialized for frontend monitoring
- [ ] Business metrics tracking purchases and failures
- [ ] PagerDuty alerts configured for critical issues
- [ ] Grafana dashboards created
- [ ] Alert rules tested with mock data
- [ ] On-call documentation updated
- [ ] Team trained on alert response
- [ ] Weekly metrics review scheduled

---

## 🚨 Alert Response Examples

### High Error Rate

```bash
# 1. Check Sentry for recent errors
curl https://sentry.io/api/0/projects/organization/aurora/issues/

# 2. View error details
npm run db:monitor | grep "Slowest Queries"

# 3. Check logs
kubectl logs -l app=aurora --tail=1000

# 4. If needed, trigger rollback
npm run deploy:rollback --to=v0.9.9
```

---

## 📚 Related Documentation

- [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) — Production operations
- [DIAGNOSTICS_QUICK_REFERENCE.md](./DIAGNOSTICS_QUICK_REFERENCE.md) — Troubleshooting
- [Sentry Documentation](https://docs.sentry.io/)
- [Datadog Documentation](https://docs.datadoghq.com/)

---

**Environment**: Production  
**Last Updated**: February 23, 2026  
**Maintained By**: Platform Engineering Team  

