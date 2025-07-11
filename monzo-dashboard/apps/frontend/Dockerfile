# ------------------------
# Install dependencies
# ------------------------
    FROM node:22-alpine AS deps
    WORKDIR /app
    
    # Copy monorepo configs & lockfile for caching
    COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
    COPY packages/*/package.json packages/*/
    COPY apps/frontend/package.json apps/frontend/
    
    RUN corepack enable && pnpm install
    
    # ------------------------
    # Build only frontend app
    # ------------------------
    FROM node:22-alpine AS builder
    WORKDIR /app
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    RUN pnpm turbo run build --filter=frontend...
    
    # ------------------------
    # Serve with nginx
    # ------------------------
    FROM nginx:alpine AS final
    
    COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
    
    # Optional: remove default nginx conf & use your own
    # COPY nginx/default.conf /etc/nginx/conf.d/default.conf
    