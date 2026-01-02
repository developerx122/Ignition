<div align="center">

# ⚡ IGNITION

### *Autonomous Token Launch Engine for Solana*

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.18-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/yourusername/ignition/graphs/commit-activity)

<br />

**Transform every new X follower into an on-chain token launch—automatically, instantly, unstoppably.**

[Getting Started](#-quick-start) •
[Documentation](#-documentation) •
[API Reference](#-api-reference) •
[Architecture](#-architecture) •
[Contributing](#-contributing)

<br />

```
    ██╗ ██████╗ ███╗   ██╗██╗████████╗██╗ ██████╗ ███╗   ██╗
    ██║██╔════╝ ████╗  ██║██║╚══██╔══╝██║██╔═══██╗████╗  ██║
    ██║██║  ███╗██╔██╗ ██║██║   ██║   ██║██║   ██║██╔██╗ ██║
    ██║██║   ██║██║╚██╗██║██║   ██║   ██║██║   ██║██║╚██╗██║
    ██║╚██████╔╝██║ ╚████║██║   ██║   ██║╚██████╔╝██║ ╚████║
    ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                    ⚡ LAUNCH PROTOCOL ⚡                     
```

</div>

---

## 📖 Table of Contents

<details>
<summary>Click to expand</summary>

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Code Examples](#-code-examples)
- [Deployment](#-deployment)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

</details>

---

## 🎯 Overview

**Ignition** is a production-grade, event-driven backend that automatically launches pump.fun tokens on Solana whenever a new follower joins your designated X (Twitter) account.

```
   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
   │             │         │             │         │             │
   │  NEW        │────────▶│  IGNITION   │────────▶│  TOKEN      │
   │  FOLLOWER   │         │  ENGINE     │         │  LAUNCHED   │
   │             │         │             │         │             │
   └─────────────┘         └─────────────┘         └─────────────┘
        𝕏                       ⚡                      ◎
```

### The Ignition Sequence

| Step | Action | Result |
|:----:|--------|--------|
| 1️⃣ | User follows your X account | Follower detected |
| 2️⃣ | Ignition generates unique metadata | Token identity created |
| 3️⃣ | Metadata uploaded to IPFS | Permanent storage |
| 4️⃣ | pump.fun transaction submitted | Token minted on Solana |
| 5️⃣ | Audit trail recorded | Full transparency |

### Why Ignition?

<table>
<tr>
<td align="center" width="33%">
<h3>🚀</h3>
<b>Fully Automated</b><br/>
Zero manual intervention required
</td>
<td align="center" width="33%">
<h3>🔒</h3>
<b>Battle-Tested</b><br/>
Idempotent, retry-safe design
</td>
<td align="center" width="33%">
<h3>⚡</h3>
<b>Lightning Fast</b><br/>
Sub-second detection to launch
</td>
</tr>
</table>

---

## 🔥 How It Works

### The Launch Lifecycle

```mermaid
flowchart LR
    A[👤 New Follower] -->|Detected| B{Ignition Engine}
    B -->|Generate| C[📝 Metadata]
    C -->|Upload| D[📦 IPFS]
    D -->|Create| E[🪙 Token]
    E -->|Confirm| F[✅ Complete]
    
    B -->|Record| G[(Database)]
    F -->|Update| G
    
    style A fill:#1DA1F2,color:#fff
    style B fill:#FF6B35,color:#fff
    style E fill:#9945FF,color:#fff
    style F fill:#00D18C,color:#fff
```

### Detailed Sequence

```mermaid
sequenceDiagram
    autonumber
    participant X as 𝕏 Twitter
    participant I as ⚡ Ignition
    participant DB as 💾 PostgreSQL
    participant IPFS as 📦 IPFS
    participant SOL as ◎ Solana

    loop Every POLL_INTERVAL
        I->>X: Poll followers
        X-->>I: Return follower list
        I->>DB: Check for new entries
    end

    rect rgb(255, 107, 53, 0.1)
        Note over I,SOL: 🔥 IGNITION SEQUENCE
        I->>DB: Insert follower (pending)
        I->>I: Generate token metadata
        I->>IPFS: Upload metadata
        IPFS-->>I: Return URI
        I->>SOL: Submit create TX
        SOL-->>I: Confirm signature
        I->>DB: Update (launched)
    end
```

---

## ✨ Features

<table>
<tr>
<td width="50%">

### ⚡ Real-Time Detection
- Continuous follower monitoring
- Configurable polling intervals
- Instant new follower identification
- Efficient delta processing

</td>
<td width="50%">

### 🛡️ Bulletproof Reliability
- Idempotent operations
- Automatic retry on failure
- Zero duplicate launches
- Graceful error recovery

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Custom Branding
- Deterministic token naming
- Custom logo support
- Flexible description templates
- Profile link integration

</td>
<td width="50%">

### 📊 Complete Audit Trail
- Full transaction history
- Status tracking per follower
- Error logging & diagnostics
- Query-ready PostgreSQL

</td>
</tr>
</table>

### Feature Matrix

```
╔══════════════════════════════════════════════════════════════════╗
║                      IGNITION CAPABILITIES                        ║
╠══════════════════════════════════════════════════════════════════╣
║  ✅ Autonomous token launches triggered by X followers            ║
║  ✅ Deterministic metadata generation from usernames              ║
║  ✅ IPFS-hosted metadata via pump.fun infrastructure              ║
║  ✅ PostgreSQL persistence with complete audit trail              ║
║  ✅ Configurable polling intervals (default: 60s)                 ║
║  ✅ Backfill mode for existing followers                          ║
║  ✅ Robust failure handling with safe retry                       ║
║  ✅ RESTful health & status endpoints                             ║
║  ✅ Full TypeScript with strict type safety                       ║
║  ✅ Docker-ready for instant deployment                           ║
║  ✅ Structured JSON logging with Pino                             ║
║  ✅ Zod-validated configuration                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🏗 Architecture

### System Overview

```mermaid
flowchart TB
    subgraph External["☁️ External Services"]
        X["𝕏 Twitter/X"]
        PUMP["🎰 pump.fun"]
        SOL["◎ Solana RPC"]
        IPFS["📦 IPFS"]
    end

    subgraph Engine["⚡ Ignition Engine"]
        SCANNER["🔍 Follower Scanner"]
        PROCESSOR["⚙️ Launch Processor"]
        METADATA["📝 Metadata Generator"]
        LAUNCHER["🚀 Token Launcher"]
    end

    subgraph Data["💾 Data Layer"]
        DB[(PostgreSQL)]
    end

    subgraph API["🌐 API Layer"]
        FASTIFY["Fastify Server"]
        HEALTH["/health"]
        STATUS["/status"]
        RETRY["/retry/:id"]
    end

    X -->|"Poll"| SCANNER
    SCANNER -->|"New Follower"| DB
    DB -->|"Pending"| PROCESSOR
    PROCESSOR --> METADATA
    METADATA -->|"Upload"| IPFS
    IPFS --> PUMP
    PROCESSOR --> LAUNCHER
    LAUNCHER -->|"TX"| SOL
    SOL -->|"Confirm"| DB
    FASTIFY --> HEALTH
    FASTIFY --> STATUS
    FASTIFY --> RETRY

    style External fill:#1a1a2e,stroke:#16213e,color:#fff
    style Engine fill:#FF6B35,stroke:#16213e,color:#fff
    style Data fill:#533483,stroke:#16213e,color:#fff
    style API fill:#0f3460,stroke:#16213e,color:#fff
```

### State Machine

```mermaid
stateDiagram-v2
    [*] --> detected: New follower found
    detected --> pending: Queued for launch
    pending --> processing: Launch initiated
    processing --> uploading: Metadata generated
    uploading --> launching: IPFS complete
    launching --> launched: TX confirmed ✅
    launching --> failed: TX failed ❌
    failed --> processing: Retry triggered 🔄
    launched --> [*]

    note right of launched
        🪙 Token live on
        pump.fun
    end note

    note right of failed
        ⚠️ Safe to retry
        No duplicates
    end note
```

### Component Interaction

```
┌────────────────────────────────────────────────────────────────────┐
│                        IGNITION ENGINE                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│   │   Scanner    │───▶│  Processor   │───▶│   Launcher   │        │
│   │              │    │              │    │              │        │
│   │  • Poll X    │    │  • Validate  │    │  • Sign TX   │        │
│   │  • Detect    │    │  • Generate  │    │  • Submit    │        │
│   │  • Queue     │    │  • Upload    │    │  • Confirm   │        │
│   └──────────────┘    └──────────────┘    └──────────────┘        │
│          │                   │                   │                 │
│          ▼                   ▼                   ▼                 │
│   ┌─────────────────────────────────────────────────────┐         │
│   │                    PostgreSQL                        │         │
│   │  • Follower records  • Launch status  • Audit logs  │         │
│   └─────────────────────────────────────────────────────┘         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Node.js** | `≥18.18` | `node --version` |
| **pnpm** | `≥8.0` | `pnpm --version` |
| **PostgreSQL** | `≥14` | `psql --version` |
| **Solana CLI** | Latest | `solana --version` |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ignition.git
cd ignition

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate:dev
```

### Configuration

Create your `.env` file:

```env
# ═══════════════════════════════════════════════════════════════════
# ⚡ IGNITION - CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────
# 💾 DATABASE
# ─────────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/ignition"

# ─────────────────────────────────────────────────────────────────────
# 🐦 X (TWITTER) CONFIGURATION
# ─────────────────────────────────────────────────────────────────────
TARGET_HANDLE="your_twitter_handle"

# Authentication Option 1: Cookies (recommended)
X_SCRAPER_COOKIES="auth_token=xxx; ct0=yyy"

# Authentication Option 2: Credentials
# X_SCRAPER_USERNAME="username"
# X_SCRAPER_PASSWORD="password"
# X_SCRAPER_EMAIL="email"
# X_SCRAPER_2FA_SECRET="secret"

# ─────────────────────────────────────────────────────────────────────
# ◎ SOLANA CONFIGURATION
# ─────────────────────────────────────────────────────────────────────
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
DEPLOYER_PRIVATE_KEY="[1,2,3,...]"

# ─────────────────────────────────────────────────────────────────────
# 🎨 TOKEN BRANDING
# ─────────────────────────────────────────────────────────────────────
TOKEN_DESCRIPTION="Launched by Ignition ⚡"
LOGO_PATH="assets/logo.png"
# LOGO_URL="https://your-domain.com/logo.png"

# ─────────────────────────────────────────────────────────────────────
# ⚙️ ENGINE SETTINGS
# ─────────────────────────────────────────────────────────────────────
HOST="0.0.0.0"
PORT=3000
LOG_LEVEL="info"
POLL_INTERVAL_MS=60000
FETCH_LIMIT=100
LAUNCH_ENABLED=true
```

### Launch Sequence

```bash
# Step 1: Backfill existing followers (prevents unwanted launches)
pnpm backfill

# Step 2: Ignite the engine
pnpm dev
```

### Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Expected response
{
  "status": "operational",
  "engine": "ignition",
  "version": "1.0.0",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## ⚙️ Configuration

### Environment Variables

<details>
<summary><b>🔴 Required Variables</b></summary>

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | `string` | PostgreSQL connection string |
| `TARGET_HANDLE` | `string` | X account to monitor for followers |
| `DEPLOYER_PRIVATE_KEY` | `string` | Solana wallet private key (JSON array) |
| `TOKEN_DESCRIPTION` | `string` | Default description for launched tokens |
| `LOGO_URL` or `LOGO_PATH` | `string` | Token logo (hosted URL or local path) |
| `LOG_LEVEL` | `string` | Logging level: debug, info, warn, error |

</details>

<details>
<summary><b>🟡 Optional Variables</b></summary>

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SOLANA_RPC_URL` | `string` | Mainnet | Solana RPC endpoint |
| `POLL_INTERVAL_MS` | `number` | `60000` | Follower polling interval (ms) |
| `FETCH_LIMIT` | `number` | `100` | Max followers to fetch per poll |
| `LAUNCH_ENABLED` | `boolean` | `true` | Enable/disable token launches |
| `HOST` | `string` | `0.0.0.0` | Server bind address |
| `PORT` | `number` | `3000` | Server port |

</details>

<details>
<summary><b>🔐 Authentication Variables</b></summary>

**Method 1: Cookie-Based (Recommended)**

| Variable | Description |
|----------|-------------|
| `X_SCRAPER_COOKIES` | Session cookies from browser |

**Method 2: Credential-Based**

| Variable | Description |
|----------|-------------|
| `X_SCRAPER_USERNAME` | X username |
| `X_SCRAPER_PASSWORD` | X password |
| `X_SCRAPER_EMAIL` | X email address |
| `X_SCRAPER_2FA_SECRET` | TOTP secret (if 2FA enabled) |

</details>

### Configuration Validation

Ignition uses Zod for runtime configuration validation:

```typescript
// src/config/schema.ts
import { z } from 'zod';

export const configSchema = z.object({
  database: z.object({
    url: z.string().url(),
  }),
  twitter: z.object({
    handle: z.string().min(1),
    cookies: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  solana: z.object({
    rpcUrl: z.string().url().default('https://api.mainnet-beta.solana.com'),
    deployerKey: z.string().min(1),
  }),
  engine: z.object({
    pollInterval: z.number().min(1000).default(60000),
    fetchLimit: z.number().min(1).max(1000).default(100),
    launchEnabled: z.boolean().default(true),
  }),
});
```

---

## 📡 API Reference

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health status |
| `GET` | `/status` | Detailed engine metrics |
| `GET` | `/followers` | List all followers |
| `GET` | `/followers/:id` | Get specific follower |
| `POST` | `/retry/:id` | Retry failed launch |

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "operational",
  "engine": "ignition",
  "version": "1.0.0",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Engine Status

```http
GET /status
```

**Response:**

```json
{
  "uptime": 86400,
  "launchEnabled": true,
  "stats": {
    "total": 1542,
    "launched": 1538,
    "pending": 3,
    "failed": 1
  },
  "lastPoll": "2024-01-15T12:00:00.000Z",
  "lastLaunch": {
    "follower": "@cryptofan",
    "token": "IGNITE_CRYPTOFAN",
    "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "timestamp": "2024-01-15T11:59:30.000Z"
  }
}
```

### List Followers

```http
GET /followers?status=launched&limit=50&offset=0
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | Filter: pending, launched, failed |
| `limit` | `number` | Results per page (default: 50) |
| `offset` | `number` | Pagination offset |

### Retry Launch

```http
POST /retry/:followerId
```

**Response:**

```json
{
  "success": true,
  "message": "Launch retry initiated",
  "followerId": "abc123",
  "status": "processing"
}
```

---

## 🗄️ Database Schema

### Entity Relationship

```mermaid
erDiagram
    FOLLOWERS {
        uuid id PK
        string username UK
        string display_name
        string profile_url
        string avatar_url
        datetime detected_at
        enum status
        datetime launched_at
        string token_address
        string token_name
        string token_symbol
        string tx_signature
        string pump_url
        string error_message
        int retry_count
        datetime created_at
        datetime updated_at
    }

    LAUNCH_LOGS {
        uuid id PK
        uuid follower_id FK
        enum action
        json details
        datetime created_at
    }

    FOLLOWERS ||--o{ LAUNCH_LOGS : "has many"
```

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum LaunchStatus {
  pending
  processing
  launched
  failed
}

model Follower {
  id            String        @id @default(uuid())
  username      String        @unique
  displayName   String?       @map("display_name")
  profileUrl    String?       @map("profile_url")
  avatarUrl     String?       @map("avatar_url")
  detectedAt    DateTime      @default(now()) @map("detected_at")
  status        LaunchStatus  @default(pending)
  launchedAt    DateTime?     @map("launched_at")
  tokenAddress  String?       @map("token_address")
  tokenName     String?       @map("token_name")
  tokenSymbol   String?       @map("token_symbol")
  txSignature   String?       @map("tx_signature")
  pumpUrl       String?       @map("pump_url")
  errorMessage  String?       @map("error_message")
  retryCount    Int           @default(0) @map("retry_count")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  logs          LaunchLog[]
  
  @@map("followers")
  @@index([status])
  @@index([detectedAt])
}

model LaunchLog {
  id          String    @id @default(uuid())
  followerId  String    @map("follower_id")
  action      String
  details     Json?
  createdAt   DateTime  @default(now()) @map("created_at")
  
  follower    Follower  @relation(fields: [followerId], references: [id])
  
  @@map("launch_logs")
  @@index([followerId])
}
```

---

## 💻 Code Examples

### Entry Point

```typescript
// src/index.ts
import { buildServer } from './server';
import { startEngine } from './engine';
import { config } from './config';
import { logger } from './lib/logger';

async function ignite() {
  logger.info('⚡ Ignition sequence initiated');
  
  // Start HTTP server
  const server = await buildServer();
  await server.listen({
    host: config.host,
    port: config.port,
  });
  
  logger.info(`🌐 Server online at http://${config.host}:${config.port}`);
  
  // Start the engine
  if (config.engine.launchEnabled) {
    await startEngine();
    logger.info('🔥 Engine running - watching for followers');
  } else {
    logger.warn('⚠️ Launch disabled - monitoring only');
  }
}

ignite().catch((err) => {
  logger.error('💥 Ignition failed:', err);
  process.exit(1);
});
```

### Follower Scanner

```typescript
// src/engine/scanner.ts
import { Scraper } from '@the-convocation/twitter-scraper';
import { prisma } from '../db';
import { processLaunch } from './launcher';
import { config } from '../config';
import { logger } from '../lib/logger';

const scraper = new Scraper();

export async function startEngine(): Promise<void> {
  await authenticate();
  
  // Initial scan
  await scanFollowers();
  
  // Start polling loop
  setInterval(async () => {
    try {
      await scanFollowers();
    } catch (error) {
      logger.error('Scan error:', error);
    }
  }, config.engine.pollInterval);
}

async function scanFollowers(): Promise<void> {
  logger.debug('🔍 Scanning for new followers...');
  
  const followers = await scraper.getFollowers(
    config.twitter.handle,
    config.engine.fetchLimit
  );
  
  let newCount = 0;
  
  for await (const follower of followers) {
    const exists = await prisma.follower.findUnique({
      where: { username: follower.username! },
    });
    
    if (!exists) {
      newCount++;
      logger.info(`🆕 New follower: @${follower.username}`);
      
      const record = await prisma.follower.create({
        data: {
          username: follower.username!,
          displayName: follower.name,
          profileUrl: `https://x.com/${follower.username}`,
          avatarUrl: follower.avatar,
        },
      });
      
      // Trigger launch sequence
      processLaunch(record.id).catch((err) => {
        logger.error(`Launch failed for @${follower.username}:`, err);
      });
    }
  }
  
  if (newCount > 0) {
    logger.info(`✨ Detected ${newCount} new follower(s)`);
  }
}

async function authenticate(): Promise<void> {
  if (config.twitter.cookies) {
    await scraper.setCookies(config.twitter.cookies);
  } else {
    await scraper.login(
      config.twitter.username!,
      config.twitter.password!,
      config.twitter.email,
      config.twitter.twoFactorSecret
    );
  }
  logger.info('✅ X authentication successful');
}
```

### Token Launcher

```typescript
// src/engine/launcher.ts
import { Connection, Keypair, Transaction } from '@solana/web3.js';
import { prisma } from '../db';
import { generateMetadata, uploadToIPFS } from '../lib/metadata';
import { buildCreateInstruction } from '../lib/pumpfun';
import { config } from '../config';
import { logger } from '../lib/logger';

export async function processLaunch(followerId: string): Promise<void> {
  // Update status to processing
  const follower = await prisma.follower.update({
    where: { id: followerId },
    data: { status: 'processing' },
  });
  
  await logAction(followerId, 'LAUNCH_STARTED');
  
  try {
    // 1. Generate metadata
    const metadata = generateMetadata(follower);
    logger.debug('📝 Metadata generated:', { name: metadata.name, symbol: metadata.symbol });
    
    // 2. Upload to IPFS
    const metadataUri = await uploadToIPFS(metadata);
    logger.debug('📦 Uploaded to IPFS:', metadataUri);
    await logAction(followerId, 'IPFS_UPLOADED', { uri: metadataUri });
    
    // 3. Build transaction
    const connection = new Connection(config.solana.rpcUrl);
    const deployer = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(config.solana.deployerKey))
    );
    
    const { instruction, tokenMint } = await buildCreateInstruction({
      deployer: deployer.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
    });
    
    const tx = new Transaction().add(instruction);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = deployer.publicKey;
    tx.sign(deployer);
    
    // 4. Submit & confirm
    const signature = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    
    // 5. Record success
    await prisma.follower.update({
      where: { id: followerId },
      data: {
        status: 'launched',
        launchedAt: new Date(),
        tokenAddress: tokenMint.toString(),
        tokenName: metadata.name,
        tokenSymbol: metadata.symbol,
        txSignature: signature,
        pumpUrl: `https://pump.fun/${tokenMint.toString()}`,
      },
    });
    
    await logAction(followerId, 'LAUNCH_SUCCESS', {
      tokenAddress: tokenMint.toString(),
      signature,
    });
    
    logger.info(`🚀 Launched: @${follower.username} → ${metadata.symbol}`);
    logger.info(`   Token: ${tokenMint.toString()}`);
    logger.info(`   TX: ${signature}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await prisma.follower.update({
      where: { id: followerId },
      data: {
        status: 'failed',
        errorMessage,
        retryCount: { increment: 1 },
      },
    });
    
    await logAction(followerId, 'LAUNCH_FAILED', { error: errorMessage });
    
    throw error;
  }
}

async function logAction(
  followerId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  await prisma.launchLog.create({
    data: {
      followerId,
      action,
      details: details ?? {},
    },
  });
}
```

### Metadata Generator

```typescript
// src/lib/metadata.ts
import { Follower } from '@prisma/client';
import { config } from '../config';
import fs from 'fs/promises';

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
}

export function generateMetadata(follower: Follower): TokenMetadata {
  // Clean username for token naming
  const clean = follower.username
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  
  // Name: max 32 chars
  const name = `IGNITE_${clean}`.slice(0, 32);
  
  // Symbol: max 10 chars
  const symbol = `I${clean.slice(0, 9)}`;
  
  return {
    name,
    symbol,
    description: `${config.token.description}\n\n🔥 Ignited: @${follower.username}`,
    image: config.token.logoUrl || '',
    twitter: `https://x.com/${follower.username}`,
  };
}

export async function uploadToIPFS(metadata: TokenMetadata): Promise<string> {
  const form = new FormData();
  
  form.append('name', metadata.name);
  form.append('symbol', metadata.symbol);
  form.append('description', metadata.description);
  form.append('twitter', metadata.twitter);
  
  if (config.token.logoPath) {
    const logo = await fs.readFile(config.token.logoPath);
    form.append('file', new Blob([logo]), 'logo.png');
  } else if (config.token.logoUrl) {
    form.append('image', config.token.logoUrl);
  }
  
  const res = await fetch('https://pump.fun/api/ipfs', {
    method: 'POST',
    body: form,
  });
  
  if (!res.ok) {
    throw new Error(`IPFS upload failed: ${res.statusText}`);
  }
  
  const data = await res.json();
  return data.metadataUri;
}
```

### Fastify Server

```typescript
// src/server.ts
import Fastify from 'fastify';
import { prisma } from './db';
import { processLaunch } from './engine/launcher';

export async function buildServer() {
  const app = Fastify({ logger: true });
  
  // Health check
  app.get('/health', async () => ({
    status: 'operational',
    engine: 'ignition',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));
  
  // Engine status
  app.get('/status', async () => {
    const [total, launched, pending, failed] = await Promise.all([
      prisma.follower.count(),
      prisma.follower.count({ where: { status: 'launched' } }),
      prisma.follower.count({ where: { status: 'pending' } }),
      prisma.follower.count({ where: { status: 'failed' } }),
    ]);
    
    const lastLaunch = await prisma.follower.findFirst({
      where: { status: 'launched' },
      orderBy: { launchedAt: 'desc' },
    });
    
    return {
      uptime: process.uptime(),
      stats: { total, launched, pending, failed },
      lastLaunch: lastLaunch ? {
        follower: `@${lastLaunch.username}`,
        token: lastLaunch.tokenName,
        address: lastLaunch.tokenAddress,
        timestamp: lastLaunch.launchedAt,
      } : null,
    };
  });
  
  // Retry failed launch
  app.post<{ Params: { id: string } }>('/retry/:id', async (req, reply) => {
    const { id } = req.params;
    
    const follower = await prisma.follower.findUnique({
      where: { id },
    });
    
    if (!follower) {
      return reply.status(404).send({ error: 'Follower not found' });
    }
    
    if (follower.status !== 'failed') {
      return reply.status(400).send({ error: 'Only failed launches can be retried' });
    }
    
    // Reset and retry
    await prisma.follower.update({
      where: { id },
      data: { status: 'pending', errorMessage: null },
    });
    
    processLaunch(id).catch(() => {});
    
    return {
      success: true,
      message: 'Launch retry initiated',
      followerId: id,
    };
  });
  
  return app;
}
```

---

## 🐳 Deployment

### Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma:generate && pnpm build

# Production
FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/assets ./assets

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  ignition:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/ignition
      TARGET_HANDLE: ${TARGET_HANDLE}
      DEPLOYER_PRIVATE_KEY: ${DEPLOYER_PRIVATE_KEY}
      TOKEN_DESCRIPTION: ${TOKEN_DESCRIPTION}
      LOGO_PATH: /app/assets/logo.png
      LOG_LEVEL: info
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ignition
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

### Launch Commands

```bash
# Build and launch
docker-compose up -d --build

# View logs
docker-compose logs -f ignition

# Run migrations
docker-compose exec ignition pnpm prisma:migrate

# Backfill existing followers
docker-compose exec ignition pnpm backfill

# Check status
curl http://localhost:3000/status
```

### Production Checklist

```
╔═══════════════════════════════════════════════════════════════════╗
║                  ⚡ IGNITION LAUNCH CHECKLIST                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  Infrastructure                                                    ║
║  □ PostgreSQL provisioned with daily backups                       ║
║  □ Solana RPC endpoint configured (Helius/QuickNode recommended)   ║
║  □ Process manager configured (PM2/systemd/k8s)                    ║
║                                                                    ║
║  Security                                                          ║
║  □ Environment variables in secret manager                         ║
║  □ Database network-isolated                                       ║
║  □ Deployer wallet funded (minimum 1 SOL)                          ║
║  □ X credentials rotated and secured                               ║
║                                                                    ║
║  Operations                                                        ║
║  □ Database migrations applied                                     ║
║  □ Existing followers backfilled                                   ║
║  □ Health endpoint monitored                                       ║
║  □ Alerting configured for failures                                ║
║  □ Log aggregation set up                                          ║
║                                                                    ║
║  Verification                                                      ║
║  □ Health check returns operational                                ║
║  □ Test follower triggers launch                                   ║
║  □ Retry mechanism functions correctly                             ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🔐 Security

### Threat Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   │
│   │  Secret Store   │   │  Network Layer  │   │  Runtime        │   │
│   │                 │   │                 │   │                 │   │
│   │  • Vault/AWS    │   │  • VPC isolated │   │  • Non-root     │   │
│   │  • Encrypted    │   │  • Firewall     │   │  • Read-only    │   │
│   │  • Rotated      │   │  • TLS only     │   │  • Limited      │   │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Security Considerations

| Asset | Risk Level | Mitigation |
|-------|:----------:|------------|
| **Deployer Private Key** | 🔴 Critical | Hardware wallet backup, minimal balance |
| **X Session Cookies** | 🟠 High | Dedicated account, regular rotation |
| **Database Credentials** | 🟠 High | Network isolation, strong passwords |
| **RPC Endpoint** | 🟡 Medium | Use reputable providers |

### Best Practices

```typescript
// ❌ NEVER do this
const privateKey = "[1,2,3,4,...]"; // Hardcoded

// ✅ Always use environment variables
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

// ❌ NEVER log sensitive data
logger.info('Key:', privateKey);

// ✅ Log safely
logger.info('Deployer:', publicKey.slice(0, 8) + '...');
```

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><b>❌ X Authentication Failed</b></summary>

**Error:**
```
Error: Failed to authenticate with X
```

**Solutions:**

1. Refresh your cookies from browser DevTools
2. Check if 2FA secret is correctly configured
3. Try credential-based authentication instead
4. Verify account isn't rate-limited

</details>

<details>
<summary><b>❌ Transaction Simulation Failed</b></summary>

**Error:**
```
Error: Transaction simulation failed: insufficient funds
```

**Solutions:**

```bash
# Check balance
solana balance <DEPLOYER_ADDRESS>

# Fund wallet
solana transfer <DEPLOYER_ADDRESS> 1 --from <SOURCE>

# Verify RPC
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  $SOLANA_RPC_URL
```

</details>

<details>
<summary><b>❌ Database Connection Error</b></summary>

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check port availability
pg_isready -h localhost -p 5432
```

</details>

### Debug Mode

```bash
# Enable verbose logging
LOG_LEVEL=debug pnpm dev

# Test individual components
pnpm test:scanner
pnpm test:launcher
pnpm test:db
```

---

## ❓ FAQ

<details>
<summary><b>How much SOL does each launch cost?</b></summary>

Each token launch costs approximately **0.02-0.05 SOL** depending on network conditions. Keep at least **1 SOL** in the deployer wallet for smooth operation.

</details>

<details>
<summary><b>Can I customize the token naming format?</b></summary>

Yes! Modify `generateMetadata()` in `src/lib/metadata.ts`:

```typescript
// Default: IGNITE_USERNAME
const name = `IGNITE_${clean}`.slice(0, 32);

// Custom: YOUR_PREFIX_USERNAME
const name = `YOUR_PREFIX_${clean}`.slice(0, 32);
```

</details>

<details>
<summary><b>What happens if the service crashes mid-launch?</b></summary>

The launch remains in `processing` or `failed` status. On restart, you can safely retry without duplicate tokens thanks to idempotent design.

</details>

<details>
<summary><b>How do I monitor launches?</b></summary>

```bash
# Via API
curl http://localhost:3000/status

# Via database
psql $DATABASE_URL -c "SELECT username, status, token_address FROM followers ORDER BY detected_at DESC LIMIT 10"

# Via logs
docker-compose logs -f ignition | grep "Launched"
```

</details>

<details>
<summary><b>Can I run on Solana devnet?</b></summary>

pump.fun only operates on mainnet. For testing:
- Set `LAUNCH_ENABLED=false`
- Test scanner functionality separately
- Use a test wallet with minimal SOL

</details>

---

## 📁 Project Structure

```
ignition/
├── 📁 src/
│   ├── 📄 index.ts              # Entry point
│   ├── 📄 server.ts             # Fastify setup
│   ├── 📁 config/
│   │   ├── 📄 index.ts          # Config loader
│   │   └── 📄 schema.ts         # Zod validation
│   ├── 📁 engine/
│   │   ├── 📄 scanner.ts        # Follower scanner
│   │   └── 📄 launcher.ts       # Token launcher
│   ├── 📁 lib/
│   │   ├── 📄 logger.ts         # Pino logger
│   │   ├── 📄 metadata.ts       # Metadata generation
│   │   └── 📄 pumpfun.ts        # pump.fun SDK wrapper
│   ├── 📁 db/
│   │   └── 📄 index.ts          # Prisma client
│   └── 📁 types/
│       └── 📄 index.ts          # TypeScript types
├── 📁 prisma/
│   ├── 📄 schema.prisma         # Database schema
│   └── 📁 migrations/           # Migration files
├── 📁 scripts/
│   ├── 📄 backfill.ts           # Backfill script
│   └── 📄 retry-failed.ts       # Batch retry script
├── 📁 assets/
│   └── 🖼️ logo.png              # Default logo
├── 📁 test/
│   └── 📄 *.test.ts             # Test files
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 package.json
├── 📄 pnpm-lock.yaml
├── 📄 tsconfig.json
├── 📄 Dockerfile
├── 📄 docker-compose.yml
└── 📄 README.md
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/ignition.git
cd ignition

# Install dependencies
pnpm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes
pnpm test
pnpm lint

# Commit (conventional commits)
git commit -m "feat: add your feature"

# Push & create PR
git push origin feature/your-feature
```

### Commit Convention

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2024 Ignition

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

### ⚡ Built for the Solana ecosystem

[![Solana](https://img.shields.io/badge/Powered%20by-Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)

**[⬆ Back to Top](#-ignition)**

</div>
