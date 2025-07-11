# ------------------------
# Install dependencies
# ------------------------
    FROM node:22-alpine AS deps
    WORKDIR /app
    
    COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
    COPY packages/*/package.json packages/*/
    COPY apps/api/package.json apps/api/
    
    RUN corepack enable && pnpm install
    
    # ------------------------
    # Build only API
    # ------------------------
    FROM node:22-alpine AS builder
    WORKDIR /app
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    RUN pnpm turbo run build --filter=api...
    
    # ------------------------
    # Start the API
    # ------------------------
    CMD ["pnpm", "start:prod", "--filter=api"]
    