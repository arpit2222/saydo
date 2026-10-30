# Multi-stage Dockerfile for SayDo API engine
# Optimized for Nebius Serverless Endpoints & container runtimes

# --- Stage 1: Base & Dependencies ---
FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Copy workspace configuration and manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/sdk/package.json ./packages/sdk/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# --- Stage 2: Builder ---
FROM base AS builder
WORKDIR /app
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared library and api engine
RUN pnpm --filter @saydo/shared build
RUN pnpm --filter @saydo/api build

# Prune devDependencies for production runtime
RUN pnpm --filter @saydo/api --prod deploy pruned

# --- Stage 3: Production Runner ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install curl for optional container debugging
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy built artifacts and production dependencies
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Use standard non-root user 'node'
RUN chown -R node:node /app
USER node

EXPOSE 4000

# Health check probe against /v1/healthz
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 4000) + '/v1/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "apps/api/dist/index.js"]
