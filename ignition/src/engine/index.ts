/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Engine Entry
 * ═══════════════════════════════════════════════════════════════════
 * Engine lifecycle management
 */

import { startScanner, stopScanner } from './scanner.js';
import { logger } from '../lib/logger.js';

let isRunning = false;

/**
 * Start the Ignition engine
 */
export async function startEngine(): Promise<void> {
  if (isRunning) {
    logger.warn('Engine is already running');
    return;
  }

  logger.info('🔥 Starting Ignition engine...');
  
  await startScanner();
  isRunning = true;
  
  logger.info('✅ Engine started successfully');
}

/**
 * Stop the Ignition engine
 */
export async function stopEngine(): Promise<void> {
  if (!isRunning) {
    logger.warn('Engine is not running');
    return;
  }

  logger.info('🛑 Stopping Ignition engine...');
  
  await stopScanner();
  isRunning = false;
  
  logger.info('✅ Engine stopped successfully');
}

/**
 * Check if engine is running
 */
export function isEngineRunning(): boolean {
  return isRunning;
}

// Re-export launcher for direct access
export { processLaunch, retryFailedLaunch } from './launcher.js';
