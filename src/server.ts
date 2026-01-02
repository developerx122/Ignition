/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Fastify Server
 * ═══════════════════════════════════════════════════════════════════
 * HTTP server for health checks, status, and management endpoints
 */

import Fastify, { FastifyInstance } from 'fastify';
import { registerRoutes } from './routes/index.js';
import { logger } from './lib/logger.js';
import { config } from './config/index.js';

/**
 * Build and configure the Fastify server
 */
export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.env === 'development' ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    } : true,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Register error handler
  app.setErrorHandler((error, request, reply) => {
    logger.error({
      err: error,
      requestId: request.id,
      url: request.url,
      method: request.method,
    }, 'Request error');

    const statusCode = error.statusCode ?? 500;
    
    reply.status(statusCode).send({
      error: true,
      message: statusCode === 500 ? 'Internal Server Error' : error.message,
      ...(config.env === 'development' && { stack: error.stack }),
    });
  });

  // Register not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: true,
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // Register routes
  await registerRoutes(app);

  // Hooks
  app.addHook('onRequest', async (request) => {
    logger.debug({
      requestId: request.id,
      method: request.method,
      url: request.url,
    }, 'Incoming request');
  });

  app.addHook('onResponse', async (request, reply) => {
    logger.debug({
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    }, 'Request completed');
  });

  return app;
}
