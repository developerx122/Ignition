#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Retry Failed Launches Script
 * ═══════════════════════════════════════════════════════════════════
 * Batch retry all failed token launches
 * 
 * Usage: pnpm retry-failed [--dry-run] [--limit N]
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface RetryConfig {
  dryRun: boolean;
  limit: number;
  maxRetryAttempts: number;
  delayBetweenMs: number;
}

/**
 * Parse command line arguments
 */
function parseArgs(): RetryConfig {
  const args = process.argv.slice(2);
  
  return {
    dryRun: args.includes('--dry-run'),
    limit: parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '100', 10),
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
    delayBetweenMs: parseInt(process.env.RETRY_DELAY_MS || '5000', 10),
  };
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main retry function
 */
async function retryFailed(): Promise<void> {
  const config = parseArgs();

  console.log('═══════════════════════════════════════════════════════');
  console.log('⚡ IGNITION - Retry Failed Launches');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📋 Mode: ${config.dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`📋 Limit: ${config.limit}`);
  console.log(`📋 Max retry attempts: ${config.maxRetryAttempts}`);
  console.log(`📋 Delay between retries: ${config.delayBetweenMs}ms`);
  console.log('');

  // Find failed launches that haven't exceeded retry limit
  const failedLaunches = await prisma.follower.findMany({
    where: {
      status: 'failed',
      retryCount: { lt: config.maxRetryAttempts },
    },
    orderBy: { detectedAt: 'asc' },
    take: config.limit,
    select: {
      id: true,
      username: true,
      retryCount: true,
      errorMessage: true,
      detectedAt: true,
    },
  });

  const totalFailed = await prisma.follower.count({
    where: { status: 'failed' },
  });

  const eligibleCount = await prisma.follower.count({
    where: {
      status: 'failed',
      retryCount: { lt: config.maxRetryAttempts },
    },
  });

  console.log(`📊 Total failed launches: ${totalFailed}`);
  console.log(`📊 Eligible for retry: ${eligibleCount}`);
  console.log(`📊 Selected for this run: ${failedLaunches.length}`);
  console.log('');

  if (failedLaunches.length === 0) {
    console.log('✅ No failed launches eligible for retry');
    return;
  }

  // Display selected launches
  console.log('Selected followers for retry:');
  console.log('─────────────────────────────────────────────────────');
  
  for (const follower of failedLaunches) {
    console.log(`  @${follower.username}`);
    console.log(`    Retry count: ${follower.retryCount}/${config.maxRetryAttempts}`);
    console.log(`    Error: ${follower.errorMessage?.slice(0, 50) || 'Unknown'}...`);
    console.log('');
  }

  if (config.dryRun) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 DRY RUN - No changes made');
    console.log('   Remove --dry-run flag to actually retry launches');
    console.log('═══════════════════════════════════════════════════════');
    return;
  }

  // Confirm before proceeding
  console.log('⚠️  WARNING: This will reset status and retry launches.');
  console.log('   Press Ctrl+C within 5 seconds to cancel...');
  await sleep(5000);

  console.log('');
  console.log('🔄 Starting retries...');
  console.log('');

  let success = 0;
  let errors = 0;

  for (const follower of failedLaunches) {
    try {
      console.log(`🔄 Retrying @${follower.username}...`);

      // Reset status to pending
      await prisma.follower.update({
        where: { id: follower.id },
        data: {
          status: 'pending',
          errorMessage: null,
        },
      });

      // Log the retry
      await prisma.launchLog.create({
        data: {
          followerId: follower.id,
          action: 'RETRY_SCHEDULED',
          details: {
            previousRetryCount: follower.retryCount,
            triggeredBy: 'retry-failed-script',
          },
        },
      });

      success++;
      console.log(`   ✅ Reset to pending`);

      // Delay between retries
      if (config.delayBetweenMs > 0) {
        await sleep(config.delayBetweenMs);
      }
    } catch (error) {
      errors++;
      console.log(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ RETRY SCHEDULING COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Reset to pending: ${success}`);
  console.log(`   Errors: ${errors}`);
  console.log('');
  console.log('ℹ️  Followers have been reset to "pending" status.');
  console.log('   The engine will process them on the next scan cycle.');
  console.log('');
}

// Run the script
retryFailed()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
