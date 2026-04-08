> Part of [[Build]]

# Monorepo Structure

## Layout
```
nap/
├── apps/
│   ├── api/                    Fastify backend
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts   Drizzle table definitions
│   │   │   │   └── migrate.ts  Auto-runs on startup
│   │   │   ├── routes/         Fastify route handlers
│   │   │   ├── services/       Business logic
│   │   │   └── server.ts       Entry point
│   │   └── drizzle/migrations/ SQL migration files + journal
│   └── web/                    React + Vite SPA
│       ├── src/
│       │   ├── components/     Shared UI (Layout.tsx)
│       │   ├── features/       Feature-sliced: businesses/, directories/, monitoring/, reporting/
│       │   ├── lib/api.ts      API_BASE export
│       │   └── App.tsx         Routes
│       └── nginx.conf          SPA fallback only (no proxy)
└── packages/
    └── shared/                 Zod schemas, shared types
        ├── src/index.ts
        └── dist/               Built output (must exist before api/web can import)
```

## Build Order
1. `packages/shared` — `npm run build` (tsc → dist/)
2. `apps/api` — imports from packages/shared dist/
3. `apps/web` — imports from packages/shared dist/ + uses VITE_API_URL

## Feature Slice Pattern (apps/web)
Each feature folder contains:
- `pages/` — Route-level React components
- `components/` — Feature-specific UI
- `hooks/` — React Query hooks (useXxx.ts)
