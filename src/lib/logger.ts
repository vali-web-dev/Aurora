/**
 * Aurora Structured Logging Utility
 * Production-ready logging with PII masking and audit trail support
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  actorId?: string;
  action?: string;
  targetId?: string;
  source?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Sensitive field patterns to mask in logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /creditcard/i,
  /ssn/i,
  /authorization/i,
];

/**
 * Mask sensitive data in objects
 */
function maskSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item));
  }

  const masked: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
    
    if (isSensitive && typeof value === 'string') {
      masked[key] = '***REDACTED***';
    } else if (typeof value === 'object') {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, error } = entry;
  
  const logObj: any = {
    level: level.toUpperCase(),
    message,
    timestamp,
  };
  
  if (context) {
    logObj.context = maskSensitiveData(context);
  }
  
  if (error) {
    logObj.error = {
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && error.stack ? { stack: error.stack } : {}),
    };
  }
  
  return JSON.stringify(logObj);
}

/**
 * Logger class
 */
class Logger {
  private minLevel: LogLevel;
  
  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    this.minLevel = ['debug', 'info', 'warn', 'error'].includes(envLevel || '') 
      ? envLevel as LogLevel 
      : 'info';
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }
  
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      } : undefined,
    };
    
    const formatted = formatLogEntry(entry);
    
    // Output to appropriate stream
    if (level === 'error' || level === 'warn') {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }
  
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }
  
  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }
  
  /**
   * Log audit events (always logged regardless of level)
   */
  audit(action: string, context: LogContext) {
    const auditEntry: LogEntry = {
      level: 'info',
      message: `AUDIT: ${action}`,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        audit: true,
      },
    };
    
    console.log(formatLogEntry(auditEntry));
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Audit logging helpers
 */
export function auditLog(action: string, context: {
  actorId?: string;
  targetId?: string;
  source?: string;
  reason?: string;
  [key: string]: any;
}) {
  logger.audit(action, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Request logging middleware helper
 */
export function logRequest(method: string, path: string, context?: LogContext) {
  logger.info(`${method} ${path}`, {
    ...context,
    method,
    path,
  });
}

/**
 * Error logging helper
 */
export function logError(message: string, error: Error, context?: LogContext) {
  logger.error(message, error, context);
}

export default logger;
