> Part of [[Build]]

# Tech Stack

## Backend — apps/api
- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **ORM**: Drizzle (PostgreSQL)
- **Queue**: BullMQ (Redis-backed)
- **Browser automation**: Playwright + Camoufox (anti-detection)
- **Validation**: Zod (shared via packages/shared)

## Frontend — apps/web
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4 — `@import "tailwindcss"`, PostCSS plugin: `@tailwindcss/postcss`
- **Routing**: React Router v6 (nested routes, Layout with Outlet)
- **Data fetching**: React Query + custom hooks
- **Notifications**: Sonner (toast)

## Shared — packages/shared
- TypeScript only
- Must run `npm run build` (tsc) before API or web can import from it
- Exports from `./dist/index.js`
- Contains: Zod validation schemas, shared types

## Critical Gotchas
1. **Tailwind v4**: Do NOT use `@tailwind base/components/utilities` — use `@import "tailwindcss"`
2. **API_BASE**: All frontend fetches must use `${API_BASE}` prefix (not relative paths). Exported from `apps/web/src/lib/api.ts`, sourced from `VITE_API_URL` env var baked at build time
3. **packages/shared**: Must build first — `dist/` directory required
4. **Docker devDeps**: Use `npm ci --include=dev` — Coolify injects `NODE_ENV=production` which skips devDeps (including TypeScript)
5. **No nginx proxy**: Don't proxy to `api` hostname in nginx.conf — Coolify doesn't set up that alias
