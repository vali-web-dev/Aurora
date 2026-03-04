import { FeatureMatrixItem } from './types';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitSnapshot {
  state: CircuitState;
  failures: number;
  openedAt: number | null;
  lastFailureMessage: string | null;
}

export interface EditorRuntimeMetrics {
  actionSuccesses: number;
  actionFailures: number;
  importSuccesses: number;
  importFailures: number;
  retriesUsed: number;
}

export interface FeatureRuntimeHealth {
  id: string;
  status: 'healthy' | 'degraded';
  reason: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<{ result: T; attempts: number }> {
  const {
    maxAttempts = 3,
    initialDelayMs = 120,
    maxDelayMs = 1800,
    backoffMultiplier = 2,
    jitter = true,
  } = options;

  let attempts = 0;
  let delay = initialDelayMs;
  let lastError: unknown;

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const result = await fn();
      return { result, attempts };
    } catch (error) {
      lastError = error;
      if (attempts >= maxAttempts) break;

      const nextDelay = Math.min(delay, maxDelayMs);
      const jitteredDelay = jitter ? Math.round(nextDelay * (0.8 + Math.random() * 0.4)) : nextDelay;
      await sleep(jitteredDelay);
      delay = Math.min(Math.round(delay * backoffMultiplier), maxDelayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Operation failed after retries.');
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private openedAt: number | null = null;
  private lastFailureMessage: string | null = null;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 4;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 15_000;
  }

  canExecute(): boolean {
    if (this.state === 'closed') return true;

    if (this.state === 'open') {
      if (this.openedAt && Date.now() - this.openedAt >= this.resetTimeoutMs) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess() {
    this.state = 'closed';
    this.failures = 0;
    this.openedAt = null;
    this.lastFailureMessage = null;
  }

  recordFailure(error?: unknown) {
    this.failures += 1;
    if (error instanceof Error) {
      this.lastFailureMessage = error.message;
    }

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    } else if (this.state === 'half-open') {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }

  snapshot(): CircuitSnapshot {
    return {
      state: this.state,
      failures: this.failures,
      openedAt: this.openedAt,
      lastFailureMessage: this.lastFailureMessage,
    };
  }
}

export function computeFeatureRuntimeHealth(items: FeatureMatrixItem[]): FeatureRuntimeHealth[] {
  return items.map((item) => {
    const hasScalability = (item.scalabilityGuardrails?.length ?? 0) > 0;
    const hasReliability = (item.reliabilityGuardrails?.length ?? 0) > 0;

    if (item.auroraStatus === 'complete' && hasScalability && hasReliability) {
      return {
        id: item.id,
        status: 'healthy',
        reason: 'Complete with scalability and reliability guardrails.',
      };
    }

    return {
      id: item.id,
      status: 'degraded',
      reason: 'Missing completion or operational guardrails.',
    };
  });
}

export function summarizeRuntimeHealth(items: FeatureMatrixItem[]) {
  const health = computeFeatureRuntimeHealth(items);
  const healthy = health.filter((item) => item.status === 'healthy').length;
  const degraded = health.length - healthy;
  const readinessPercent = health.length === 0 ? 0 : Math.round((healthy / health.length) * 100);

  return {
    total: health.length,
    healthy,
    degraded,
    readinessPercent,
  };
}
