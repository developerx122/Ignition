/**
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ IGNITION - pump.fun SDK
 * ═══════════════════════════════════════════════════════════════════
 * pump.fun program interaction utilities
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { config } from '../config/index.js';
import { logger } from './logger.js';

/**
 * pump.fun program addresses
 * These are hardcoded as they are protocol constants
 */
export const PUMP_FUN_PROGRAM_ID = new PublicKey(
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
);

export const PUMP_FUN_GLOBAL = new PublicKey(
  '4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf'
);

export const PUMP_FUN_FEE_RECIPIENT = new PublicKey(
  'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbCJtGmPmfGj2t'
);

export const PUMP_FUN_EVENT_AUTHORITY = new PublicKey(
  'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * Create instruction parameters
 */
export interface CreateTokenParams {
  deployer: PublicKey;
  name: string;
  symbol: string;
  uri: string;
}

/**
 * Create instruction result
 */
export interface CreateTokenResult {
  instruction: TransactionInstruction;
  tokenMint: PublicKey;
  bondingCurve: PublicKey;
  associatedBondingCurve: PublicKey;
  metadata: PublicKey;
}

/**
 * Derive pump.fun bonding curve PDA
 */
export function deriveBondingCurve(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('bonding-curve'), mint.toBuffer()],
    PUMP_FUN_PROGRAM_ID
  );
}

/**
 * Derive associated token account
 */
export function deriveAssociatedTokenAccount(
  owner: PublicKey,
  mint: PublicKey
): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

/**
 * Derive metadata PDA
 */
export function deriveMetadata(mint: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );
  return address;
}

/**
 * Build the pump.fun create token instruction
 */
export async function buildCreateInstruction(
  params: CreateTokenParams
): Promise<CreateTokenResult> {
  const { deployer, name, symbol, uri } = params;

  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  // Derive PDAs
  const [bondingCurve] = deriveBondingCurve(mint);
  const associatedBondingCurve = deriveAssociatedTokenAccount(bondingCurve, mint);
  const metadata = deriveMetadata(mint);

  logger.debug({
    mint: mint.toBase58(),
    bondingCurve: bondingCurve.toBase58(),
    metadata: metadata.toBase58(),
  }, 'Derived program addresses');

  // Build instruction data
  // pump.fun create instruction discriminator + serialized params
  const discriminator = Buffer.from([0x18, 0x1e, 0xc8, 0x28, 0x05, 0x1c, 0x07, 0x77]);
  
  const nameBuffer = Buffer.alloc(4 + name.length);
  nameBuffer.writeUInt32LE(name.length, 0);
  nameBuffer.write(name, 4);

  const symbolBuffer = Buffer.alloc(4 + symbol.length);
  symbolBuffer.writeUInt32LE(symbol.length, 0);
  symbolBuffer.write(symbol, 4);

  const uriBuffer = Buffer.alloc(4 + uri.length);
  uriBuffer.writeUInt32LE(uri.length, 0);
  uriBuffer.write(uri, 4);

  const data = Buffer.concat([discriminator, nameBuffer, symbolBuffer, uriBuffer]);

  // Build instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: mint, isSigner: true, isWritable: true },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: PUMP_FUN_GLOBAL, isSigner: false, isWritable: false },
      { pubkey: MPL_TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: metadata, isSigner: false, isWritable: true },
      { pubkey: deployer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_EVENT_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PUMP_FUN_PROGRAM_ID,
    data,
  });

  return {
    instruction,
    tokenMint: mint,
    bondingCurve,
    associatedBondingCurve,
    metadata,
  };
}

/**
 * Get Solana connection instance
 */
export function getConnection(): Connection {
  return new Connection(config.solana.rpcUrl, {
    commitment: config.solana.commitment,
  });
}

/**
 * Get deployer keypair from config
 */
export function getDeployerKeypair(): Keypair {
  try {
    const privateKeyArray = JSON.parse(config.solana.deployerPrivateKey);
    return Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
  } catch (error) {
    throw new Error('Failed to parse deployer private key. Ensure it is a valid JSON array.');
  }
}

/**
 * Send and confirm transaction
 */
export async function sendAndConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> {
  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signers[0]?.publicKey;

  // Sign transaction
  transaction.sign(...signers);

  // Send transaction
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: config.solana.commitment,
  });

  logger.debug({ signature }, 'Transaction submitted');

  // Confirm transaction
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    config.solana.commitment
  );

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }

  logger.info({ signature }, '✅ Transaction confirmed');

  return signature;
}
