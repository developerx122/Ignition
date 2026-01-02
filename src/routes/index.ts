/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - API Routes
 * ═══════════════════════════════════════════════════════════════════
 * HTTP endpoint definitions
 */

import { FastifyInstance } from 'fastify';
import { prisma, getDatabaseStats, checkDatabaseHealth } from '../db/index.js';
import { isEngineRunning, retryFailedLaunch } from '../engine/index.js';
import { getScannerStatus } from '../engine/scanner.js';
import { getLaunchStats } from '../engine/launcher.js';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';

/**
 * Register all routes
 */
export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // ─────────────────────────────────────────────────────────────────
  // Health Check
  // ─────────────────────────────────────────────────────────────────
  app.get('/health', async () => {
    const dbHealthy = await checkDatabaseHealth();
    
    return {
      status: dbHealthy ? 'operational' : 'degraded',
      engine: 'ignition',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        engine: isEngineRunning() ? 'running' : 'stopped',
      },
    };
  });

  // ─────────────────────────────────────────────────────────────────
  // Detailed Status
  // ─────────────────────────────────────────────────────────────────
  app.get('/status', async () => {
    const [dbStats, launchStats, scannerStatus] = await Promise.all([
      getDatabaseStats(),
      getLaunchStats(),
      Promise.resolve(getScannerStatus()),
    ]);

    const lastLaunch = await prisma.follower.findFirst({
      where: { status: 'launched' },
      orderBy: { launchedAt: 'desc' },
      select: {
        username: true,
        tokenName: true,
        tokenSymbol: true,
        tokenAddress: true,
        pumpUrl: true,
        launchedAt: true,
      },
    });

    return {
      engine: {
        running: isEngineRunning(),
        launchEnabled: config.launchEnabled,
        target: config.twitter.handle,
        pollInterval: config.pollIntervalMs,
      },
      scanner: scannerStatus,
      stats: {
        followers: dbStats,
        launches: launchStats,
      },
      lastLaunch: lastLaunch
        ? {
            follower: `@${lastLaunch.username}`,
            token: {
              name: lastLaunch.tokenName,
              symbol: lastLaunch.tokenSymbol,
              address: lastLaunch.tokenAddress,
            },
            pumpUrl: lastLaunch.pumpUrl,
            timestamp: lastLaunch.launchedAt,
          }
        : null,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  // ─────────────────────────────────────────────────────────────────
  // List Followers
  // ─────────────────────────────────────────────────────────────────
  app.get<{
    Querystring: {
      status?: string;
      limit?: number;
      offset?: number;
    };
  }>('/followers', async (request) => {
    const { status, limit = 50, offset = 0 } = request.query;

    const where = status ? { status: status as any } : {};

    const [followers, total] = await Promise.all([
      prisma.follower.findMany({
        where,
        take: Math.min(limit, 100),
        skip: offset,
        orderBy: { detectedAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          status: true,
          tokenName: true,
          tokenSymbol: true,
          tokenAddress: true,
          pumpUrl: true,
          detectedAt: true,
          launchedAt: true,
          retryCount: true,
          errorMessage: true,
        },
      }),
      prisma.follower.count({ where }),
    ]);

    return {
      followers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + followers.length < total,
      },
    };
  });

  // ─────────────────────────────────────────────────────────────────
  // Get Single Follower
  // ─────────────────────────────────────────────────────────────────
  app.get<{
    Params: { id: string };
  }>('/followers/:id', async (request, reply) => {
    const { id } = request.params;

    const follower = await prisma.follower.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!follower) {
      return reply.status(404).send({
        error: true,
        message: 'Follower not found',
      });
    }

    return { follower };
  });

  // ─────────────────────────────────────────────────────────────────
  // Retry Failed Launch
  // ─────────────────────────────────────────────────────────────────
  app.post<{
    Params: { id: string };
  }>('/retry/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      // Trigger retry (async)
      retryFailedLaunch(id).catch((error) => {
        logger.error({ id, error: error.message }, 'Retry failed');
      });

      return {
        success: true,
        message: 'Launch retry initiated',
        followerId: id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.status(400).send({
        error: true,
        message,
      });
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // Get Recent Logs
  // ─────────────────────────────────────────────────────────────────
  app.get<{
    Querystring: {
      limit?: number;
      action?: string;
    };
  }>('/logs', async (request) => {
    const { limit = 50, action } = request.query;

    const where = action ? { action } : {};

    const logs = await prisma.launchLog.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            username: true,
          },
        },
      },
    });

    return { logs };
  });

  // ─────────────────────────────────────────────────────────────────
  // Stats Summary
  // ─────────────────────────────────────────────────────────────────
  app.get('/stats', async () => {
    const [dbStats, launchStats] = await Promise.all([
      getDatabaseStats(),
      getLaunchStats(),
    ]);

    // Get launches by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLaunches = await prisma.follower.groupBy({
      by: ['status'],
      where: {
        detectedAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    return {
      overview: {
        ...dbStats,
        ...launchStats,
      },
      recentActivity: recentLaunches,
      timestamp: new Date().toISOString(),
    };
  });
}
