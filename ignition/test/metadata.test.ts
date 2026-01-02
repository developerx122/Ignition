/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - Metadata Tests
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMetadata } from '../src/lib/metadata.js';
import { Follower, LaunchStatus } from '@prisma/client';

// Mock config
vi.mock('../src/config/index.js', () => ({
  config: {
    token: {
      description: 'Test description',
      logoUrl: 'https://example.com/logo.png',
      logoPath: undefined,
    },
  },
}));

describe('Metadata Generation', () => {
  const createMockFollower = (username: string, displayName?: string): Follower => ({
    id: 'test-id',
    username,
    displayName: displayName ?? null,
    profileUrl: `https://x.com/${username}`,
    avatarUrl: null,
    twitterId: null,
    detectedAt: new Date(),
    status: 'pending' as LaunchStatus,
    launchedAt: null,
    tokenAddress: null,
    tokenName: null,
    tokenSymbol: null,
    metadataUri: null,
    txSignature: null,
    pumpUrl: null,
    errorMessage: null,
    retryCount: 0,
    lastRetryAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('generateMetadata', () => {
    it('should generate valid token name from username', () => {
      const follower = createMockFollower('cryptofan');
      const metadata = generateMetadata(follower);
      
      expect(metadata.name).toBe('IGNITE_CRYPTOFAN');
      expect(metadata.name.length).toBeLessThanOrEqual(32);
    });

    it('should generate valid token symbol from username', () => {
      const follower = createMockFollower('cryptofan');
      const metadata = generateMetadata(follower);
      
      expect(metadata.symbol).toBe('ICRYPTOFAN');
      expect(metadata.symbol.length).toBeLessThanOrEqual(10);
    });

    it('should handle usernames with special characters', () => {
      const follower = createMockFollower('crypto_fan_123!');
      const metadata = generateMetadata(follower);
      
      expect(metadata.name).toBe('IGNITE_CRYPTOFAN123');
      expect(metadata.symbol).toBe('ICRYPTOFA');
    });

    it('should truncate long usernames', () => {
      const follower = createMockFollower('verylongusernamethatexceedslimits');
      const metadata = generateMetadata(follower);
      
      expect(metadata.name.length).toBeLessThanOrEqual(32);
      expect(metadata.symbol.length).toBeLessThanOrEqual(10);
    });

    it('should include twitter link', () => {
      const follower = createMockFollower('testuser');
      const metadata = generateMetadata(follower);
      
      expect(metadata.twitter).toBe('https://x.com/testuser');
    });

    it('should include description with follower mention', () => {
      const follower = createMockFollower('testuser');
      const metadata = generateMetadata(follower);
      
      expect(metadata.description).toContain('Test description');
      expect(metadata.description).toContain('@testuser');
    });

    it('should include display name in description if available', () => {
      const follower = createMockFollower('testuser', 'Test User');
      const metadata = generateMetadata(follower);
      
      expect(metadata.description).toContain('Test User');
    });

    it('should set showName to true', () => {
      const follower = createMockFollower('testuser');
      const metadata = generateMetadata(follower);
      
      expect(metadata.showName).toBe(true);
    });

    it('should convert username to uppercase', () => {
      const follower = createMockFollower('MixedCase');
      const metadata = generateMetadata(follower);
      
      expect(metadata.name).toBe('IGNITE_MIXEDCASE');
      expect(metadata.symbol).toBe('IMIXEDCAS');
    });
  });
});
