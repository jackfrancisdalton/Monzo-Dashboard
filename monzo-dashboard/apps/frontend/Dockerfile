FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html