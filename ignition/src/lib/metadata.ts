/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Token Metadata
 * ═══════════════════════════════════════════════════════════════════
 * Token metadata generation and IPFS upload
 */

import fs from 'fs/promises';
import { Follower } from '@prisma/client';
import { config } from '../config/index.js';
import { logger } from './logger.js';

/**
 * Token metadata structure
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
  website?: string;
  showName: boolean;
  createdOn: string;
}

/**
 * IPFS upload response
 */
interface IPFSResponse {
  metadataUri: string;
  metadata: TokenMetadata;
}

/**
 * Maximum lengths for on-chain metadata
 */
const MAX_NAME_LENGTH = 32;
const MAX_SYMBOL_LENGTH = 10;

/**
 * Sanitize username for token naming
 */
function sanitizeUsername(username: string): string {
  return username
    .replace(/[^a-zA-Z0-9]/g, '') // Remove non-alphanumeric
    .toUpperCase();
}

/**
 * Generate deterministic token metadata from follower profile
 */
export function generateMetadata(follower: Follower): TokenMetadata {
  const sanitized = sanitizeUsername(follower.username);
  
  // Token name: IGNITE_USERNAME (max 32 chars)
  const name = `IGNITE_${sanitized}`.slice(0, MAX_NAME_LENGTH);
  
  // Symbol: IUSERNAME (max 10 chars)
  const symbol = `I${sanitized.slice(0, MAX_SYMBOL_LENGTH - 1)}`;
  
  // Description with follower info
  const description = [
    config.token.description,
    '',
    `🔥 Ignited: @${follower.username}`,
    follower.displayName ? `👤 ${follower.displayName}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  logger.debug({
    username: follower.username,
    name,
    symbol,
  }, 'Generated token metadata');

  return {
    name,
    symbol,
    description,
    image: config.token.logoUrl || '',
    twitter: `https://x.com/${follower.username}`,
    showName: true,
    createdOn: 'https://pump.fun',
  };
}

/**
 * Upload metadata to pump.fun IPFS
 */
export async function uploadToIPFS(metadata: TokenMetadata): Promise<string> {
  const formData = new FormData();
  
  // Add metadata fields
  formData.append('name', metadata.name);
  formData.append('symbol', metadata.symbol);
  formData.append('description', metadata.description);
  formData.append('twitter', metadata.twitter);
  formData.append('showName', String(metadata.showName));
  
  // Add logo
  if (config.token.logoPath) {
    try {
      const logoBuffer = await fs.readFile(config.token.logoPath);
      formData.append('file', new Blob([logoBuffer], { type: 'image/png' }), 'logo.png');
      logger.debug({ path: config.token.logoPath }, 'Using local logo file');
    } catch (error) {
      logger.error({ path: config.token.logoPath, error }, 'Failed to read logo file');
      throw new Error(`Failed to read logo file: ${config.token.logoPath}`);
    }
  } else if (config.token.logoUrl) {
    formData.append('image', config.token.logoUrl);
    logger.debug({ url: config.token.logoUrl }, 'Using remote logo URL');
  } else {
    throw new Error('No logo configured (LOGO_PATH or LOGO_URL required)');
  }

  // Upload to pump.fun
  logger.debug('Uploading metadata to IPFS...');
  
  const response = await fetch('https://pump.fun/api/ipfs', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    }, 'IPFS upload failed');
    throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as IPFSResponse;
  
  logger.info({
    metadataUri: result.metadataUri,
    name: metadata.name,
    symbol: metadata.symbol,
  }, '📦 Metadata uploaded to IPFS');

  return result.metadataUri;
}
