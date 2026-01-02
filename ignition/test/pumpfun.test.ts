/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - pump.fun SDK Tests
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi } from 'vitest';
import { PublicKey, Keypair } from '@solana/web3.js';
import {
  deriveBondingCurve,
  deriveAssociatedTokenAccount,
  deriveMetadata,
  PUMP_FUN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from '../src/lib/pumpfun.js';

// Mock config
vi.mock('../src/config/index.js', () => ({
  config: {
    solana: {
      rpcUrl: 'https://api.devnet.solana.com',
      deployerPrivateKey: JSON.stringify(Array(64).fill(1)),
      commitment: 'confirmed',
    },
  },
}));

describe('pump.fun SDK', () => {
  describe('Program IDs', () => {
    it('should have valid pump.fun program ID', () => {
      expect(PUMP_FUN_PROGRAM_ID).toBeInstanceOf(PublicKey);
      expect(PUMP_FUN_PROGRAM_ID.toBase58()).toBe(
        '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
      );
    });

    it('should have valid token program ID', () => {
      expect(TOKEN_PROGRAM_ID).toBeInstanceOf(PublicKey);
      expect(TOKEN_PROGRAM_ID.toBase58()).toBe(
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      );
    });

    it('should have valid associated token program ID', () => {
      expect(ASSOCIATED_TOKEN_PROGRAM_ID).toBeInstanceOf(PublicKey);
      expect(ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()).toBe(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
      );
    });

    it('should have valid metadata program ID', () => {
      expect(MPL_TOKEN_METADATA_PROGRAM_ID).toBeInstanceOf(PublicKey);
      expect(MPL_TOKEN_METADATA_PROGRAM_ID.toBase58()).toBe(
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      );
    });
  });

  describe('PDA Derivation', () => {
    const mockMint = Keypair.generate().publicKey;

    it('should derive bonding curve PDA', () => {
      const [bondingCurve, bump] = deriveBondingCurve(mockMint);
      
      expect(bondingCurve).toBeInstanceOf(PublicKey);
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    it('should derive consistent bonding curve for same mint', () => {
      const [bondingCurve1] = deriveBondingCurve(mockMint);
      const [bondingCurve2] = deriveBondingCurve(mockMint);
      
      expect(bondingCurve1.toBase58()).toBe(bondingCurve2.toBase58());
    });

    it('should derive different bonding curves for different mints', () => {
      const mockMint2 = Keypair.generate().publicKey;
      
      const [bondingCurve1] = deriveBondingCurve(mockMint);
      const [bondingCurve2] = deriveBondingCurve(mockMint2);
      
      expect(bondingCurve1.toBase58()).not.toBe(bondingCurve2.toBase58());
    });

    it('should derive associated token account', () => {
      const owner = Keypair.generate().publicKey;
      const ata = deriveAssociatedTokenAccount(owner, mockMint);
      
      expect(ata).toBeInstanceOf(PublicKey);
    });

    it('should derive metadata PDA', () => {
      const metadata = deriveMetadata(mockMint);
      
      expect(metadata).toBeInstanceOf(PublicKey);
    });

    it('should derive consistent metadata for same mint', () => {
      const metadata1 = deriveMetadata(mockMint);
      const metadata2 = deriveMetadata(mockMint);
      
      expect(metadata1.toBase58()).toBe(metadata2.toBase58());
    });
  });
});
