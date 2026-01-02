/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Configuration
 * ═══════════════════════════════════════════════════════════════════
 * Centralized configuration with Zod validation
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration schema with validation
 */
const configSchema = z.object({
  // Environment
  env: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server
  host: z.string().default('0.0.0.0'),
  port: z.coerce.number().min(1).max(65535).default(3000),
  
  // Logging
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Database
  databaseUrl: z.string().url(),
  
  // Twitter/X
  twitter: z.object({
    handle: z.string().min(1),
    cookies: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    email: z.string().optional(),
    twoFactorSecret: z.string().optional(),
  }),
  
  // Solana
  solana: z.object({
    rpcUrl: z.string().url().default('https://api.mainnet-beta.solana.com'),
    deployerPrivateKey: z.string().min(1),
    commitment: z.enum(['processed', 'confirmed', 'finalized']).default('confirmed'),
  }),
  
  // Token branding
  token: z.object({
    description: z.string().default('Launched by Ignition ⚡'),
    logoPath: z.string().optional(),
    logoUrl: z.string().url().optional(),
  }),
  
  // Engine settings
  pollIntervalMs: z.coerce.number().min(1000).default(60000),
  fetchLimit: z.coerce.number().min(1).max(1000).default(100),
  launchEnabled: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(true)
  ),
  maxRetryAttempts: z.coerce.number().min(0).default(3),
  retryDelayMs: z.coerce.number().min(0).default(5000),
});

/**
 * Parse and validate configuration
 */
function loadConfig() {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    host: process.env.HOST,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    databaseUrl: process.env.DATABASE_URL,
    twitter: {
      handle: process.env.TARGET_HANDLE,
      cookies: process.env.X_SCRAPER_COOKIES,
      username: process.env.X_SCRAPER_USERNAME,
      password: process.env.X_SCRAPER_PASSWORD,
      email: process.env.X_SCRAPER_EMAIL,
      twoFactorSecret: process.env.X_SCRAPER_2FA_SECRET,
    },
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL,
      deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY,
      commitment: process.env.TX_COMMITMENT,
    },
    token: {
      description: process.env.TOKEN_DESCRIPTION,
      logoPath: process.env.LOGO_PATH,
      logoUrl: process.env.LOGO_URL,
    },
    pollIntervalMs: process.env.POLL_INTERVAL_MS,
    fetchLimit: process.env.FETCH_LIMIT,
    launchEnabled: process.env.LAUNCH_ENABLED,
    maxRetryAttempts: process.env.MAX_RETRY_ATTEMPTS,
    retryDelayMs: process.env.RETRY_DELAY_MS,
  });

  if (!result.success) {
    console.error('❌ Configuration validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

/**
 * Validated configuration object
 */
export const config = loadConfig();

/**
 * Configuration type
 */
export type Config = z.infer<typeof configSchema>;
