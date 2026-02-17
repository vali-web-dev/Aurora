/**
 * Aurora Security Configuration
 * Production-ready security headers and middleware configuration
 */

export const securityHeaders = [
  // HSTS - Force HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // XSS Protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Referrer Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Tighten for production
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' wss: https:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

/**
 * Rate Limiting Configuration
 */
export const rateLimits = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
  },
  // API endpoints (authenticated)
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  // Public endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  },
  // Admin endpoints
  admin: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  },
};

/**
 * Session Configuration
 */
export const sessionConfig = {
  // Session duration
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
  
  // Cookie settings
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access to cookie
    sameSite: 'lax' as const, // CSRF protection
    path: '/',
  },
};

/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * API Response Error Messages (Production-Safe)
 */
export const errorMessages = {
  // Never expose detailed error information in production
  unauthorized: 'Authentication required',
  forbidden: 'Access denied',
  notFound: 'Resource not found',
  badRequest: 'Invalid request',
  serverError: 'Internal server error',
  tooManyRequests: 'Too many requests. Please try again later.',
  
  // Auth-specific
  invalidCredentials: 'Invalid email or password',
  accountLocked: 'Account temporarily locked. Please try again later.',
  sessionExpired: 'Session expired. Please sign in again.',
};

/**
 * Password Policy
 */
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true, // Prevent using name, email, etc.
};

/**
 * Audit Logging Configuration
 */
export const auditConfig = {
  // Events to always log
  criticalEvents: [
    'user.signin',
    'user.signout',
    'user.signup',
    'user.delete',
    'user.password_change',
    'user.email_change',
    'admin.access',
    'admin.action',
    'data.export',
    'data.delete',
    'settings.change',
  ],
  
  // Log retention
  retentionDays: {
    critical: 730, // 2 years
    security: 365, // 1 year
    standard: 90, // 90 days
  },
  
  // PII fields to mask in logs
  maskFields: [
    'password',
    'passwordHash',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
  ],
};

/**
 * Feature Flags
 */
export const featureFlags = {
  enableRealtime: process.env.ENABLE_REAL_TIME === 'true',
  enablePayments: process.env.ENABLE_PAYMENTS === 'true',
  enableAI: process.env.ENABLE_AI_FEATURES === 'true',
  enableOAuth: !!(process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_ID),
};

/**
 * Database Security
 */
export const dbSecurity = {
  // Connection pool
  pool: {
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  
  // SSL/TLS enforcement
  ssl: process.env.NODE_ENV === 'production',
  
  // Query timeout
  statementTimeout: 30000, // 30 seconds
};

/**
 * Security Headers Middleware Helper
 */
export function applySecurityHeaders(headers: Headers) {
  securityHeaders.forEach(({ key, value }) => {
    headers.set(key, value);
  });
  return headers;
}

/**
 * Validate Request Origin
 */
export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin request
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);
  
  return allowedOrigins.some(allowed => origin === allowed);
}

/**
 * Sanitize Error for Client Response
 */
export function sanitizeError(error: unknown): { message: string; code?: string } {
  if (process.env.NODE_ENV === 'development') {
    // Show detailed errors in development
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
    };
  }
  
  // Generic error in production
  return {
    message: errorMessages.serverError,
  };
}

export default {
  securityHeaders,
  rateLimits,
  sessionConfig,
  corsConfig,
  errorMessages,
  passwordPolicy,
  auditConfig,
  featureFlags,
  dbSecurity,
};
