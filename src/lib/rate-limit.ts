/**
 * Aurora Rate Limiting Middleware
 * Simple in-memory rate limiter for API routes
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  check(identifier: string, windowMs: number, max: number): { allowed: boolean; remaining: number; resetTime:number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { allowed: true, remaining: max - 1, resetTime: now + windowMs };
    }

    if (entry.count >= max) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return { allowed: true, remaining: max - entry.count, resetTime: entry.resetTime };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration by route type
 */
export const rateLimitConfig = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests
  },
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests
  },
};

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: Request): string {
  // Try to get user ID from session (if authenticated)
  // For now, use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(config: { windowMs: number; max: number }) {
  return async function middleware(request: Request): Promise<Response | null> {
    const identifier = getIdentifier(request);
    const result = rateLimiter.check(identifier, config.windowMs, config.max);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    // Add rate limit headers to response (will be set by the calling route)
    return null; // Allow request to proceed
  };
}

/**
 * Helper to add rate limit headers to a successful response
 */
export function  addRateLimitHeaders(
  headers: Headers,
  config: { max: number },
  result: { remaining: number; resetTime: number }
): Headers {
  headers.set('X-RateLimit-Limit', config.max.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetTime.toString());
  return headers;
}

/**
 * Convenience functions for common rate limits
 */
export const rateLimitAuth = () => rateLimit(rateLimitConfig.auth);
export const rateLimitAPI = () => rateLimit(rateLimitConfig.api);
export const rateLimitPublic = () => rateLimit(rateLimitConfig.public);
export const rateLimitAdmin = () => rateLimit(rateLimitConfig.admin);

export default rateLimiter;
