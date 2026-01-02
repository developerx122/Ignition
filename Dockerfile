# ═══════════════════════════════════════════════════════════════════
# ⚡ IGNITION - DOCKERFILE
# ═══════════════════════════════════════════════════════════════════
# Multi-stage build for optimized production image

# ─────────────────────────────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies first (better caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
RUN pnpm prisma:generate
RUN pnpm build

# Prune dev dependencies
RUN pnpm prune --prod

# ─────────────────────────────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 ignition && \
    adduser --system --uid 1001 ignition

# Copy production files
COPY --from=builder --chown=ignition:ignition /app/dist ./dist
COPY --from=builder --chown=ignition:ignition /app/node_modules ./node_modules
COPY --from=builder --chown=ignition:ignition /app/package.json ./
COPY --from=builder --chown=ignition:ignition /app/prisma ./prisma
COPY --from=builder --chown=ignition:ignition /app/assets ./assets

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Switch to non-root user
USER ignition

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
