/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Database Client
 * ═══════════════════════════════════════════════════════════════════
 * Prisma client singleton with connection management
 */

import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';

// Declare global prisma instance for development hot reloading
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Create Prisma client with logging configuration
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: config.env === 'development' 
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [
          { level: 'error', emit: 'stdout' },
        ],
  });
}

/**
 * Singleton Prisma client instance
 * In development, we store the client on globalThis to survive hot reloads
 */
export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (config.env === 'development') {
  globalThis.__prisma = prisma;
}

// Log queries in development
if (config.env === 'development') {
  // @ts-expect-error - Prisma event types
  prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
    logger.debug({
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    }, 'Database query');
  });
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Database statistics
 */
export async function getDatabaseStats() {
  const [totalFollowers, launched, pending, failed] = await Promise.all([
    prisma.follower.count(),
    prisma.follower.count({ where: { status: 'launched' } }),
    prisma.follower.count({ where: { status: 'pending' } }),
    prisma.follower.count({ where: { status: 'failed' } }),
  ]);

  return {
    total: totalFollowers,
    launched,
    pending,
    failed,
    processing: totalFollowers - launched - pending - failed,
  };
}
