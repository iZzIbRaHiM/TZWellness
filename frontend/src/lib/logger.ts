/**
 * Structured Logging Utility
 * 
 * Provides consistent, structured logging across the application.
 * Integrates with Sentry when available.
 * 
 * Usage:
 *   logger.info("User booked appointment", { referenceId: "ABC123" });
 *   logger.error("Booking failed", error, { userId: 123 });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Check if we're in browser
const isBrowser = typeof window !== "undefined";

// Check if development
const isDev = process.env.NODE_ENV === "development";

/**
 * Format a structured log entry
 */
function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): StructuredLog {
  const log: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    log.context = context;
  }

  if (error) {
    log.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return log;
}

/**
 * Send log to console with appropriate formatting
 */
function consoleLog(log: StructuredLog): void {
  const prefix = `[${log.level.toUpperCase()}]`;
  const timestamp = isDev ? "" : `[${log.timestamp}]`;

  switch (log.level) {
    case "debug":
      if (isDev) {
        console.debug(prefix, timestamp, log.message, log.context || "");
      }
      break;
    case "info":
      console.info(prefix, timestamp, log.message, log.context || "");
      break;
    case "warn":
      console.warn(prefix, timestamp, log.message, log.context || "");
      break;
    case "error":
      console.error(prefix, timestamp, log.message, log.context || "", log.error || "");
      break;
  }
}

/**
 * Send error to Sentry if available
 */
function sendToSentry(log: StructuredLog, originalError?: Error): void {
  // Skip if not in browser or no Sentry
  if (!isBrowser) return;

  // Check for Sentry global (will be set by Sentry SDK)
  const Sentry = (window as { Sentry?: { captureException: (e: Error, ctx?: unknown) => void; captureMessage: (m: string, ctx?: unknown) => void } }).Sentry;
  
  if (!Sentry) return;

  if (log.level === "error" && originalError) {
    Sentry.captureException(originalError, {
      extra: log.context,
    });
  } else if (log.level === "error" || log.level === "warn") {
    Sentry.captureMessage(log.message, {
      level: log.level,
      extra: log.context,
    });
  }
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug log - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    const log = formatLog("debug", message, context);
    consoleLog(log);
  },

  /**
   * Info log - general information
   */
  info(message: string, context?: LogContext): void {
    const log = formatLog("info", message, context);
    consoleLog(log);
  },

  /**
   * Warning log - potential issues
   */
  warn(message: string, context?: LogContext): void {
    const log = formatLog("warn", message, context);
    consoleLog(log);
    sendToSentry(log);
  },

  /**
   * Error log - errors that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const actualError = error instanceof Error ? error : undefined;
    const log = formatLog("error", message, context, actualError);
    consoleLog(log);
    sendToSentry(log, actualError);
  },

  /**
   * Log a booking lifecycle event
   */
  booking: {
    started(context: { serviceId?: string; patientType?: string }): void {
      logger.info("Booking started", { ...context, event: "booking_started" });
    },

    stepCompleted(step: number, context?: LogContext): void {
      logger.info(`Booking step ${step} completed`, { ...context, event: "booking_step", step });
    },

    submitted(referenceId: string, context?: LogContext): void {
      logger.info("Booking submitted", { ...context, event: "booking_submitted", referenceId });
    },

    failed(error: Error | string, context?: LogContext): void {
      const errorObj = typeof error === "string" ? new Error(error) : error;
      logger.error("Booking failed", errorObj, { ...context, event: "booking_failed" });
    },

    cancelled(referenceId: string, reason?: string): void {
      logger.info("Booking cancelled", { event: "booking_cancelled", referenceId, reason });
    },
  },

  /**
   * Log an API request/response
   */
  api: {
    request(endpoint: string, method: string): void {
      logger.debug(`API ${method} ${endpoint}`, { event: "api_request", endpoint, method });
    },

    response(endpoint: string, status: number, success: boolean): void {
      const level = success ? "debug" : "warn";
      logger[level](`API response ${status}`, { event: "api_response", endpoint, status, success });
    },

    error(endpoint: string, error: Error | string): void {
      const errorObj = typeof error === "string" ? new Error(error) : error;
      logger.error(`API error: ${endpoint}`, errorObj, { event: "api_error", endpoint });
    },
  },

  /**
   * Log admin actions
   */
  admin: {
    login(userId: number, email: string): void {
      logger.info("Admin login", { event: "admin_login", userId, email });
    },

    logout(): void {
      logger.info("Admin logout", { event: "admin_logout" });
    },

    action(action: string, targetId: number | string, context?: LogContext): void {
      logger.info(`Admin action: ${action}`, { ...context, event: "admin_action", action, targetId });
    },
  },
};

export default logger;
