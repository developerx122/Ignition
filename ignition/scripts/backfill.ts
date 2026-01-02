#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Backfill Script
 * ═══════════════════════════════════════════════════════════════════
 * Backfill existing followers without triggering launches
 * 
 * Usage: pnpm backfill
 * 
 * This script should be run ONCE before enabling the engine to prevent
 * existing followers from triggering unwanted token launches.
 */

import { Scraper } from '@the-convocation/twitter-scraper';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface BackfillConfig {
  handle: string;
  cookies?: string;
  username?: string;
  password?: string;
  email?: string;
  twoFactorSecret?: string;
  batchSize: number;
  maxFollowers: number;
}

/**
 * Load configuration from environment
 */
function loadConfig(): BackfillConfig {
  const handle = process.env.TARGET_HANDLE;
  
  if (!handle) {
    console.error('❌ TARGET_HANDLE environment variable is required');
    process.exit(1);
  }

  return {
    handle,
    cookies: process.env.X_SCRAPER_COOKIES,
    username: process.env.X_SCRAPER_USERNAME,
    password: process.env.X_SCRAPER_PASSWORD,
    email: process.env.X_SCRAPER_EMAIL,
    twoFactorSecret: process.env.X_SCRAPER_2FA_SECRET,
    batchSize: parseInt(process.env.BACKFILL_BATCH_SIZE || '100', 10),
    maxFollowers: parseInt(process.env.BACKFILL_MAX_FOLLOWERS || '10000', 10),
  };
}

/**
 * Initialize and authenticate the scraper
 */
async function initializeScraper(config: BackfillConfig): Promise<Scraper> {
  const scraper = new Scraper();

  if (config.cookies) {
    const cookies = config.cookies.split(';').map((cookie) => {
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
    console.log('✅ Authenticated with cookies');
  } else if (config.username && config.password) {
    await scraper.login(
      config.username,
      config.password,
      config.email,
      config.twoFactorSecret
    );
    console.log('✅ Authenticated with credentials');
  } else {
    throw new Error('No authentication method configured');
  }

  const isLoggedIn = await scraper.isLoggedIn();
  if (!isLoggedIn) {
    throw new Error('Failed to authenticate with X');
  }

  return scraper;
}

/**
 * Main backfill function
 */
async function backfill(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════');
  console.log('⚡ IGNITION - Follower Backfill');
  console.log('═══════════════════════════════════════════════════════');

  const config = loadConfig();
  
  console.log(`📋 Target account: @${config.handle}`);
  console.log(`📋 Batch size: ${config.batchSize}`);
  console.log(`📋 Max followers: ${config.maxFollowers}`);
  console.log('');

  // Check existing followers
  const existingCount = await prisma.follower.count();
  console.log(`📊 Existing followers in database: ${existingCount}`);

  if (existingCount > 0) {
    console.log('');
    console.log('⚠️  WARNING: Database already contains followers.');
    console.log('   Running backfill again may create duplicates.');
    console.log('   Press Ctrl+C within 5 seconds to cancel...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Initialize scraper
  console.log('');
  console.log('🔑 Authenticating with X...');
  const scraper = await initializeScraper(config);

  // Fetch and backfill followers
  console.log('');
  console.log(`🔍 Fetching followers for @${config.handle}...`);
  console.log('');

  const followers = scraper.getFollowers(config.handle, config.maxFollowers);

  let processed = 0;
  let added = 0;
  let skipped = 0;
  let errors = 0;

  const startTime = Date.now();

  for await (const follower of followers) {
    processed++;

    if (!follower.username) {
      errors++;
      continue;
    }

    try {
      // Check if already exists
      const existing = await prisma.follower.findUnique({
        where: { username: follower.username },
      });

      if (existing) {
        skipped++;
      } else {
        // Insert with 'skipped' status to prevent launches
        await prisma.follower.create({
          data: {
            username: follower.username,
            displayName: follower.name ?? null,
            profileUrl: `https://x.com/${follower.username}`,
            avatarUrl: follower.avatar ?? null,
            twitterId: follower.userId ?? null,
            status: 'skipped', // Mark as skipped to prevent launches
          },
        });
        added++;
      }

      // Progress update every 100 followers
      if (processed % 100 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   Processed: ${processed} | Added: ${added} | Skipped: ${skipped} | Errors: ${errors} | Time: ${elapsed}s`);
      }
    } catch (error) {
      errors++;
      if (error instanceof Error && !error.message.includes('Unique constraint')) {
        console.error(`   ❌ Error processing @${follower.username}: ${error.message}`);
      }
    }
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ BACKFILL COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Total processed: ${processed}`);
  console.log(`   New followers added: ${added}`);
  console.log(`   Already existed: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total time: ${totalTime}s`);
  console.log('');
  console.log('ℹ️  All backfilled followers are marked as "skipped" status');
  console.log('   to prevent token launches. You can now safely start the engine.');
  console.log('');

  // Logout
  await scraper.logout();
}

// Run the script
backfill()
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
