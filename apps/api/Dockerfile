FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first (layer cache)
COPY package.json package-lock.json turbo.json ./
COPY tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# --include=dev ensures devDependencies (typescript, etc.) are installed
# even when Coolify passes NODE_ENV=production as a build arg
RUN npm ci --include=dev

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package then API
RUN npm run build -w packages/shared
RUN npm run build -w apps/api

# ---- Production stage ----
# Use Debian-based image — Alpine lacks the system libs Playwright needs
FROM node:20
WORKDIR /app

# Runtime: hoisted node_modules + built packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle

# Install Chromium + system dependencies for Playwright browser adapters
RUN npx playwright install chromium --with-deps

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3000

# Run migrations then start server
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]
