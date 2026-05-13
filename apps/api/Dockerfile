FROM node:20-bullseye-slim AS base
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies
FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
RUN npm install --workspace=apps/api --workspace=packages/shared

# Build
FROM deps AS builder
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npm run build

# Runtime
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages ./packages
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["sh", "-c", "npm run db:push && npm run db:seed && node dist/index.js"]
