/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Logger
 * ═══════════════════════════════════════════════════════════════════
 * Structured logging with Pino
 */

import pino from 'pino';

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

/**
 * Create Pino logger instance
 */
export const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({}),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: {
    service: 'ignition',
  },
});

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

/**
 * Log levels type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
