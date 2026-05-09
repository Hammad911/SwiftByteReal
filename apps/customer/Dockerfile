FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/customer/package.json ./apps/customer/
RUN npm install --workspace=apps/customer --workspace=packages/shared --workspace=packages/ui

FROM deps AS builder
COPY packages/ ./packages/
COPY apps/customer/ ./apps/customer/
RUN cd apps/customer && npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/customer/.next/standalone ./
COPY --from=builder /app/apps/customer/.next/static ./.next/static
COPY --from=builder /app/apps/customer/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
