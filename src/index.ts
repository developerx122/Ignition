/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Entry Point
 * ═══════════════════════════════════════════════════════════════════
 * Autonomous Token Launch Engine for Solana
 */

import { buildServer } from './server.js';
import { startEngine, stopEngine } from './engine/index.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { prisma } from './db/index.js';

/**
 * Main ignition sequence
 */
async function ignite(): Promise<void> {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('⚡ IGNITION - Token Launch Engine');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`Environment: ${config.env}`);
  logger.info(`Log Level: ${config.logLevel}`);

  // Test database connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Build and start HTTP server
  const server = await buildServer();
  
  try {
    await server.listen({
      host: config.host,
      port: config.port,
    });
    logger.info(`🌐 Server online at http://${config.host}:${config.port}`);
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }

  // Start the engine if enabled
  if (config.launchEnabled) {
    try {
      await startEngine();
      logger.info('🔥 Engine running - watching for followers');
      logger.info(`   Target: @${config.twitter.handle}`);
      logger.info(`   Poll Interval: ${config.pollIntervalMs}ms`);
    } catch (error) {
      logger.error('❌ Failed to start engine:', error);
      process.exit(1);
    }
  } else {
    logger.warn('⚠️ Launch disabled - monitoring only mode');
  }

  logger.info('═══════════════════════════════════════════════════════');
  logger.info('⚡ IGNITION SEQUENCE COMPLETE');
  logger.info('═══════════════════════════════════════════════════════');
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  logger.info(`\n📴 Received ${signal}, initiating graceful shutdown...`);
  
  try {
    // Stop the engine
    await stopEngine();
    logger.info('✅ Engine stopped');
    
    // Disconnect from database
    await prisma.$disconnect();
    logger.info('✅ Database disconnected');
    
    logger.info('👋 Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
ignite().catch((error) => {
  logger.error('💥 Ignition failed:', error);
  process.exit(1);
});
