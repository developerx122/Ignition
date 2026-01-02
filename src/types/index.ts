/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Type Definitions
 * ═══════════════════════════════════════════════════════════════════
 * Shared TypeScript types and interfaces
 */

import { Follower, LaunchLog, LaunchStatus } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────
// Re-exports from Prisma
// ─────────────────────────────────────────────────────────────────────

export type { Follower, LaunchLog, LaunchStatus };

// ─────────────────────────────────────────────────────────────────────
// Twitter/X Types
// ─────────────────────────────────────────────────────────────────────

export interface TwitterProfile {
  userId?: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
}

export interface TwitterCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Lax' | 'Strict' | 'None';
}

// ─────────────────────────────────────────────────────────────────────
// Token Types
// ─────────────────────────────────────────────────────────────────────

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

export interface LaunchResult {
  success: boolean;
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  metadataUri?: string;
  txSignature?: string;
  pumpUrl?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'operational' | 'degraded' | 'offline';
  engine: string;
  version: string;
  timestamp: string;
  checks: {
    database: 'healthy' | 'unhealthy';
    engine: 'running' | 'stopped';
  };
}

export interface StatusResponse {
  engine: {
    running: boolean;
    launchEnabled: boolean;
    target: string;
    pollInterval: number;
  };
  scanner: {
    isRunning: boolean;
    isScanning: boolean;
    isAuthenticated: boolean;
  };
  stats: {
    followers: {
      total: number;
      launched: number;
      pending: number;
      failed: number;
      processing: number;
    };
    launches: {
      totalLaunches: number;
      totalFailed: number;
      lastPollAt: Date | null;
    };
  };
  lastLaunch: {
    follower: string;
    token: {
      name: string | null;
      symbol: string | null;
      address: string | null;
    };
    pumpUrl: string | null;
    timestamp: Date | null;
  } | null;
  uptime: number;
  timestamp: string;
}

export interface FollowerListResponse {
  followers: FollowerSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface FollowerSummary {
  id: string;
  username: string;
  displayName: string | null;
  status: LaunchStatus;
  tokenName: string | null;
  tokenSymbol: string | null;
  tokenAddress: string | null;
  pumpUrl: string | null;
  detectedAt: Date;
  launchedAt: Date | null;
  retryCount: number;
  errorMessage: string | null;
}

export interface FollowerDetailResponse {
  follower: Follower & {
    logs: LaunchLog[];
  };
}

export interface RetryResponse {
  success: boolean;
  message: string;
  followerId: string;
}

export interface ErrorResponse {
  error: boolean;
  message: string;
  stack?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Event Types
// ─────────────────────────────────────────────────────────────────────

export type LaunchAction =
  | 'DETECTED'
  | 'LAUNCH_STARTED'
  | 'IPFS_UPLOADED'
  | 'TX_SUBMITTED'
  | 'LAUNCH_SUCCESS'
  | 'LAUNCH_FAILED'
  | 'RETRY_SCHEDULED';

export interface LaunchEvent {
  followerId: string;
  action: LaunchAction;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────────────
// Utility Types
// ─────────────────────────────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncResult<T, E = Error> = Promise<
  | { success: true; data: T }
  | { success: false; error: E }
>;
