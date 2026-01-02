/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Follower Scanner
 * ═══════════════════════════════════════════════════════════════════
 * Monitors X account for new followers
 */

import { Scraper, Profile } from '@the-convocation/twitter-scraper';
import { prisma } from '../db/index.js';
import { config } from '../config/index.js';
import { logger, createChildLogger } from '../lib/logger.js';
import { processLaunch } from './launcher.js';

const scannerLogger = createChildLogger({ component: 'scanner' });

let scraper: Scraper | null = null;
let pollInterval: NodeJS.Timeout | null = null;
let isScanning = false;

/**
 * Initialize and authenticate the scraper
 */
async function initializeScraper(): Promise<void> {
  scraper = new Scraper();

  if (config.twitter.cookies) {
    // Parse cookies string and set them
    const cookies = config.twitter.cookies.split(';').map((cookie) => {
      const [name, value] = cookie.trim().split('=');
      return {
        name: name?.trim() ?? '',
        value: value?.trim() ?? '',
        domain: '.x.com',
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Lax' as const,
      };
    });

    await scraper.setCookies(cookies);
    scannerLogger.info('✅ Authenticated with cookies');
  } else if (config.twitter.username && config.twitter.password) {
    await scraper.login(
      config.twitter.username,
      config.twitter.password,
      config.twitter.email,
      config.twitter.twoFactorSecret
    );
    scannerLogger.info('✅ Authenticated with credentials');
  } else {
    throw new Error('No authentication method configured (cookies or credentials required)');
  }

  // Verify authentication
  const isLoggedIn = await scraper.isLoggedIn();
  if (!isLoggedIn) {
    throw new Error('Failed to authenticate with X');
  }
}

/**
 * Scan for new followers
 */
async function scanFollowers(): Promise<void> {
  if (isScanning) {
    scannerLogger.debug('Scan already in progress, skipping...');
    return;
  }

  if (!scraper) {
    scannerLogger.error('Scraper not initialized');
    return;
  }

  isScanning = true;
  const startTime = Date.now();

  try {
    scannerLogger.debug(`🔍 Scanning @${config.twitter.handle} for followers...`);

    const followers = scraper.getFollowers(
      config.twitter.handle,
      config.fetchLimit
    );

    let newCount = 0;
    let processedCount = 0;

    for await (const follower of followers) {
      processedCount++;

      if (!follower.username) {
        scannerLogger.warn('Follower without username, skipping');
        continue;
      }

      // Check if already in database
      const existing = await prisma.follower.findUnique({
        where: { username: follower.username },
      });

      if (existing) {
        continue; // Already tracked
      }

      // New follower detected!
      newCount++;
      scannerLogger.info(`🆕 New follower detected: @${follower.username}`);

      // Insert into database
      const record = await prisma.follower.create({
        data: {
          username: follower.username,
          displayName: follower.name ?? null,
          profileUrl: `https://x.com/${follower.username}`,
          avatarUrl: follower.avatar ?? null,
          twitterId: follower.userId ?? null,
        },
      });

      // Log detection
      await prisma.launchLog.create({
        data: {
          followerId: record.id,
          action: 'DETECTED',
          details: {
            displayName: follower.name,
            avatar: follower.avatar,
          },
        },
      });

      // Trigger launch (async, don't wait)
      processLaunch(record.id).catch((error) => {
        scannerLogger.error({
          followerId: record.id,
          username: follower.username,
          error: error instanceof Error ? error.message : error,
        }, 'Launch failed');
      });
    }

    const duration = Date.now() - startTime;
    
    // Update system state
    await prisma.systemState.upsert({
      where: { id: 'singleton' },
      create: {
        lastPollAt: new Date(),
      },
      update: {
        lastPollAt: new Date(),
      },
    });

    if (newCount > 0) {
      scannerLogger.info({
        newFollowers: newCount,
        processed: processedCount,
        duration: `${duration}ms`,
      }, `✨ Scan complete - ${newCount} new follower(s)`);
    } else {
      scannerLogger.debug({
        processed: processedCount,
        duration: `${duration}ms`,
      }, 'Scan complete - no new followers');
    }
  } catch (error) {
    scannerLogger.error({
      error: error instanceof Error ? error.message : error,
    }, '❌ Scan failed');
    
    // Re-initialize scraper on auth errors
    if (error instanceof Error && error.message.includes('auth')) {
      scannerLogger.warn('Re-initializing scraper due to auth error...');
      await initializeScraper();
    }
  } finally {
    isScanning = false;
  }
}

/**
 * Start the follower scanner
 */
export async function startScanner(): Promise<void> {
  scannerLogger.info('🔍 Starting follower scanner...');
  
  // Initialize scraper
  await initializeScraper();
  
  // Run initial scan
  await scanFollowers();
  
  // Start polling loop
  pollInterval = setInterval(async () => {
    await scanFollowers();
  }, config.pollIntervalMs);

  scannerLogger.info({
    handle: config.twitter.handle,
    pollInterval: `${config.pollIntervalMs}ms`,
    fetchLimit: config.fetchLimit,
  }, '✅ Scanner started');
}

/**
 * Stop the follower scanner
 */
export async function stopScanner(): Promise<void> {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  
  if (scraper) {
    await scraper.logout();
    scraper = null;
  }

  scannerLogger.info('✅ Scanner stopped');
}

/**
 * Get scanner status
 */
export function getScannerStatus() {
  return {
    isRunning: pollInterval !== null,
    isScanning,
    isAuthenticated: scraper !== null,
  };
}
