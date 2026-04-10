# Use Debian-based image for both stages — Playwright needs system libs unavailable in Alpine
FROM node:20 AS builder
WORKDIR /app

# Copy workspace manifests first (layer cache)
COPY package.json package-lock.json turbo.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# --include=dev ensures devDependencies (typescript, etc.) are installed
# even when Coolify passes NODE_ENV=production as a build arg
RUN npm ci --include=dev

# Install Playwright system deps + download Chromium in builder (cached layer)
RUN npx playwright install-deps chromium
RUN npx playwright install chromium

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package then API
RUN npm run build -w packages/shared
RUN npm run build -w apps/api

# ---- Production stage ----
FROM node:20
WORKDIR /app

# Copy node_modules first so npx can find the playwright CLI
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle

# Install Playwright system runtime dependencies (apt libs for Chromium)
RUN npx playwright install-deps chromium

# Copy downloaded Chromium browser from builder
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3000

# Run migrations then start server
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]
