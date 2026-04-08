> Part of [[Build]]

# Deployment

## Infrastructure
- **Platform**: Coolify (self-hosted) at `cool.fediddy.com`
- **App URL**: `nap.fediddy.com`
- **DNS**: Cloudflare (A record pointing to Coolify VPS IP)

## Coolify Apps
See memory file `reference_coolify_nap.md` for UUIDs and internal URLs.
- **Web app**: React SPA served via nginx
- **API app**: Fastify Node.js server
- **PostgreSQL**: Managed Coolify database
- **Redis**: Managed Coolify Redis (BullMQ backing)

## Environment Variables (API)
- `DATABASE_URL` — PostgreSQL connection string (Coolify auto-injects)
- `REDIS_URL` — Redis connection string (Coolify auto-injects)
- `NODE_ENV` — Coolify injects `production`

## Environment Variables (Web)
- `VITE_API_URL` — Full URL to API (e.g. `https://api.nap.fediddy.com`) — baked at build time

## Docker Build Notes
- Both Dockerfiles use multi-stage builds
- `npm ci --include=dev` required (Coolify injects NODE_ENV=production → devDeps skipped otherwise)
- `COPY tsconfig.json ./` required in builder stage
- packages/shared built in API Dockerfile before `tsc` compile

## Migration Strategy
- Drizzle migrations run automatically on API container start via `node dist/db/migrate.js`
- Raw SQL migration files: must manually add entry to `apps/api/drizzle/migrations/meta/_journal.json`
- Seed migrations (0003, 0004): directory data seeded via SQL ON CONFLICT DO NOTHING
