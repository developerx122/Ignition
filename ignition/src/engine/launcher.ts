/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Token Launcher
 * ═══════════════════════════════════════════════════════════════════
 * Handles the token launch sequence on pump.fun
 */

import { Keypair, Transaction } from '@solana/web3.js';
import { prisma } from '../db/index.js';
import { config } from '../config/index.js';
import { logger, createChildLogger } from '../lib/logger.js';
import { generateMetadata, uploadToIPFS } from '../lib/metadata.js';
import {
  buildCreateInstruction,
  getConnection,
  getDeployerKeypair,
  sendAndConfirmTransaction,
} from '../lib/pumpfun.js';

const launcherLogger = createChildLogger({ component: 'launcher' });

/**
 * Log an action for a follower
 */
async function logAction(
  followerId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  await prisma.launchLog.create({
    data: {
      followerId,
      action,
      details: details ?? null,
    },
  });
}

/**
 * Process a token launch for a follower
 */
export async function processLaunch(followerId: string): Promise<void> {
  const startTime = Date.now();

  // Get follower record
  const follower = await prisma.follower.findUnique({
    where: { id: followerId },
  });

  if (!follower) {
    throw new Error(`Follower not found: ${followerId}`);
  }

  if (follower.status === 'launched') {
    launcherLogger.warn({ followerId, username: follower.username }, 'Already launched, skipping');
    return;
  }

  launcherLogger.info({ username: follower.username }, '🚀 Starting launch sequence...');

  // Update status to processing
  await prisma.follower.update({
    where: { id: followerId },
    data: { status: 'processing' },
  });

  await logAction(followerId, 'LAUNCH_STARTED');

  try {
    // Step 1: Generate metadata
    launcherLogger.debug({ username: follower.username }, 'Generating metadata...');
    const metadata = generateMetadata(follower);
    
    launcherLogger.debug({
      name: metadata.name,
      symbol: metadata.symbol,
    }, '📝 Metadata generated');

    // Step 2: Upload to IPFS
    launcherLogger.debug({ username: follower.username }, 'Uploading to IPFS...');
    const metadataUri = await uploadToIPFS(metadata);
    
    await logAction(followerId, 'IPFS_UPLOADED', { uri: metadataUri });

    // Step 3: Build transaction
    launcherLogger.debug({ username: follower.username }, 'Building transaction...');
    const connection = getConnection();
    const deployer = getDeployerKeypair();

    const { instruction, tokenMint } = await buildCreateInstruction({
      deployer: deployer.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
    });

    // Create new mint keypair (must sign the transaction)
    const mintKeypair = Keypair.generate();
    
    const transaction = new Transaction().add(instruction);

    await logAction(followerId, 'TX_SUBMITTED', {
      mint: tokenMint.toBase58(),
    });

    // Step 4: Send and confirm transaction
    launcherLogger.debug({ username: follower.username }, 'Submitting transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [deployer, mintKeypair]
    );

    // Step 5: Update database with success
    const pumpUrl = `https://pump.fun/${tokenMint.toBase58()}`;
    
    await prisma.follower.update({
      where: { id: followerId },
      data: {
        status: 'launched',
        launchedAt: new Date(),
        tokenAddress: tokenMint.toBase58(),
        tokenName: metadata.name,
        tokenSymbol: metadata.symbol,
        metadataUri,
        txSignature: signature,
        pumpUrl,
        errorMessage: null,
      },
    });

    // Update system stats
    await prisma.systemState.upsert({
      where: { id: 'singleton' },
      create: {
        totalLaunches: 1,
      },
      update: {
        totalLaunches: { increment: 1 },
      },
    });

    await logAction(followerId, 'LAUNCH_SUCCESS', {
      tokenAddress: tokenMint.toBase58(),
      signature,
      pumpUrl,
    });

    const duration = Date.now() - startTime;

    launcherLogger.info({
      username: follower.username,
      tokenName: metadata.name,
      tokenSymbol: metadata.symbol,
      tokenAddress: tokenMint.toBase58(),
      signature,
      pumpUrl,
      duration: `${duration}ms`,
    }, '🚀 LAUNCH SUCCESS');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update database with failure
    await prisma.follower.update({
      where: { id: followerId },
      data: {
        status: 'failed',
        errorMessage,
        retryCount: { increment: 1 },
        lastRetryAt: new Date(),
      },
    });

    // Update system stats
    await prisma.systemState.upsert({
      where: { id: 'singleton' },
      create: {
        totalFailed: 1,
      },
      update: {
        totalFailed: { increment: 1 },
      },
    });

    await logAction(followerId, 'LAUNCH_FAILED', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    launcherLogger.error({
      username: follower.username,
      followerId,
      error: errorMessage,
    }, '❌ Launch failed');

    throw error;
  }
}

/**
 * Retry a failed launch
 */
export async function retryFailedLaunch(followerId: string): Promise<void> {
  const follower = await prisma.follower.findUnique({
    where: { id: followerId },
  });

  if (!follower) {
    throw new Error(`Follower not found: ${followerId}`);
  }

  if (follower.status !== 'failed') {
    throw new Error(`Cannot retry: status is ${follower.status}, not failed`);
  }

  if (follower.retryCount >= config.maxRetryAttempts) {
    throw new Error(`Max retry attempts (${config.maxRetryAttempts}) exceeded`);
  }

  launcherLogger.info({
    username: follower.username,
    retryCount: follower.retryCount,
  }, '🔄 Retrying failed launch...');

  // Reset status to pending
  await prisma.follower.update({
    where: { id: followerId },
    data: {
      status: 'pending',
      errorMessage: null,
    },
  });

  await logAction(followerId, 'RETRY_SCHEDULED', {
    previousRetryCount: follower.retryCount,
  });

  // Process the launch
  await processLaunch(followerId);
}

/**
 * Get launch statistics
 */
export async function getLaunchStats() {
  const stats = await prisma.systemState.findUnique({
    where: { id: 'singleton' },
  });

  return {
    totalLaunches: stats?.totalLaunches ?? 0,
    totalFailed: stats?.totalFailed ?? 0,
    lastPollAt: stats?.lastPollAt ?? null,
  };
}
