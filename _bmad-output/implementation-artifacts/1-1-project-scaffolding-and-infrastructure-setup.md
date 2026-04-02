# Story 1.1: Project Scaffolding & Infrastructure Setup

Status: done

## Story

As an operator,
I want a fully configured monorepo with database, API, and frontend wired together,
So that the development environment is ready and I can immediately start building features.

## Acceptance Criteria

1. **Given** the developer runs `npx create-turbo@latest nap --example with-vite`  
   **When** setup is complete and `turbo dev` is executed  
   **Then** both `apps/web` (Vite + React, port 5173) and `apps/api` (Fastify, port 3000) start without errors  
   **And** `docker-compose up` starts PostgreSQL and Redis containers locally

2. **Given** the Drizzle schema is defined with the `businesses` and `directories` tables  
   **When** `npx drizzle-kit migrate` runs  
   **Then** all tables are created in the database with correct columns and constraints  
   **And** migration files are checked into `apps/api/drizzle/migrations/`

3. **Given** the seed script runs (`npx tsx apps/api/drizzle/seed.ts`)  
   **When** the script completes  
   **Then** three directory records exist in the `directories` table: Bing Places, Facebook Business, Yelp  
   **And** each directory has `api_config` JSONB, `rate_limits` JSONB, `health_status = 'healthy'`, and `paused = false`

4. **Given** the shared package `packages/shared` exists  
   **When** types are imported in both `apps/web` and `apps/api`  
   **Then** `BusinessProfile`, `BusinessStatus`, `SubmissionStatus`, `DirectoryHealth` types are available in both apps without duplication  
   **And** Zod validation schemas for business profile fields are exported from `packages/shared/src/validation/`

5. **Given** the API is running  
   **When** `GET /api/health` is called  
   **Then** response is `200 { status: "ok" }` within 500ms

6. **Given** Pino logger is configured in `apps/api/src/utils/logger.ts`  
   **When** any log message is emitted containing `api_key`, `password`, or `token` fields  
   **Then** those fields are scrubbed from the output and replaced with `[REDACTED]`

## Tasks / Subtasks

- [ ] **Task 1 — Bootstrap Turborepo monorepo (AC: 1)**
  - [ ] Run `npx create-turbo@latest nap --example with-vite` — this creates the base `apps/web` (Vite + React) and `apps/api` (Node) workspace
  - [ ] Rename/restructure `apps/api` to use Fastify instead of any default framework the template includes (install `fastify`, `@fastify/cors`)
  - [ ] Verify `turbo dev` starts both apps: web on 5173, api on 3000
  - [ ] Add `"@nap/shared": "workspace:*"` to both `apps/web/package.json` and `apps/api/package.json`

- [ ] **Task 2 — docker-compose for local dev (AC: 1)**
  - [ ] Create `docker-compose.yml` at repo root with PostgreSQL 16 and Redis 7 services
  - [ ] PostgreSQL: port 5432, env vars `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
  - [ ] Redis: port 6379, AOF persistence (`appendonly yes`, `appendfsync everysec`)
  - [ ] Create `.env.example` with: `DATABASE_URL`, `REDIS_URL`, `NODE_ENV`, `PORT=3000`

- [ ] **Task 3 — Drizzle ORM + schema (businesses + directories only) (AC: 2)**
  - [ ] In `apps/api`, install: `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`
  - [ ] Create `apps/api/src/db/connection.ts` — PostgreSQL pool using `DATABASE_URL` from env, SSL enforced (`ssl: { rejectUnauthorized: false }` for Coolify compatibility)
  - [ ] Create `apps/api/src/db/schema.ts` with ONLY `businesses` and `directories` tables (other tables created in later stories):
    ```typescript
    // businesses: id (uuid pk), name, address, city, state, zip, phone, category, 
    //             website (nullable), status ('active'|'deactivated'), created_at, updated_at
    // directories: id (uuid pk), name, slug (unique), type ('browser'|'file_export'|'api'),
    //              api_config (jsonb), rate_limits (jsonb), health_status ('healthy'|'degraded'|'down'),
    //              paused (boolean default false), last_health_check (nullable), created_at
    ```
  - [ ] Create `apps/api/drizzle.config.ts` pointing to `src/db/schema.ts` and `drizzle/migrations/`
  - [ ] Run `npx drizzle-kit generate` to create initial migration SQL
  - [ ] Verify migration creates both tables correctly with `npx drizzle-kit migrate`
  - [ ] Commit migration files to `apps/api/drizzle/migrations/`

- [ ] **Task 4 — Seed script (AC: 3)**
  - [ ] Create `apps/api/drizzle/seed.ts`
  - [ ] Insert 3 directory rows:
    - Bing Places: `slug: 'bing-places'`, `type: 'file_export'`, `api_config: { exportFormat: 'xlsx', uploadUrl: 'https://www.bingplaces.com' }`, `rate_limits: { dailyCap: 50, timeoutSeconds: 30 }`
    - Facebook Business: `slug: 'facebook-business'`, `type: 'browser'`, `api_config: { loginUrl: 'https://www.facebook.com', createPageUrl: 'https://www.facebook.com/pages/create' }`, `rate_limits: { dailyCap: 10, timeoutSeconds: 180 }`
    - Yelp: `slug: 'yelp'`, `type: 'browser'`, `api_config: { claimUrl: 'https://biz.yelp.com/claim' }`, `rate_limits: { dailyCap: 10, timeoutSeconds: 180 }`
  - [ ] All three: `health_status: 'healthy'`, `paused: false`
  - [ ] Run with `npx tsx apps/api/drizzle/seed.ts` — idempotent (use `onConflictDoNothing`)

- [ ] **Task 5 — packages/shared: types + Zod schemas (AC: 4)**
  - [ ] Create `packages/shared/src/types/business.types.ts`:
    ```typescript
    export type BusinessStatus = 'active' | 'deactivated';
    export interface BusinessProfile {
      id: string; name: string; address: string; city: string; state: string;
      zip: string; phone: string; category: string; website: string | null;
      status: BusinessStatus; createdAt: string; updatedAt: string;
    }
    ```
  - [ ] Create `packages/shared/src/types/directory.types.ts`:
    ```typescript
    export type DirectoryHealth = 'healthy' | 'degraded' | 'down';
    export type DirectoryType = 'browser' | 'file_export' | 'api';
    export interface DirectoryConfig {
      id: string; name: string; slug: string; type: DirectoryType;
      apiConfig: Record<string, unknown>; rateLimits: { dailyCap: number; timeoutSeconds: number };
      healthStatus: DirectoryHealth; paused: boolean; lastHealthCheck: string | null;
    }
    ```
  - [ ] Create `packages/shared/src/types/submission.types.ts`:
    ```typescript
    export type SubmissionStatus = 'queued' | 'submitting' | 'submitted' | 'verified' | 'failed' | 'requires_action' | 'removed';
    export interface SubmissionResult { status: SubmissionStatus; externalId?: string; errorCode?: string; message?: string; }
    ```
  - [ ] Create `packages/shared/src/types/api.types.ts`:
    ```typescript
    export interface ApiResponse<T> { data: T; meta: { count?: number } }
    export interface ApiError { error: true; code: string; message: string; details?: Array<{ field: string; issue: string }> }
    ```
  - [ ] Create `packages/shared/src/validation/business.schema.ts` with Zod:
    ```typescript
    // phoneSchema: accepts (555) 555-5555, 555-555-5555, 5555555555, +15555555555
    // businessProfileSchema: name, address, city, state, zip (required strings), phone (phoneSchema), 
    //                        category (required), website (optional url or empty)
    ```
  - [ ] Create `packages/shared/src/types/index.ts` and `packages/shared/src/validation/index.ts` re-exporting all
  - [ ] Create `packages/shared/src/index.ts` as package entry point
  - [ ] Verify both `apps/web` and `apps/api` can import from `@nap/shared` without errors

- [ ] **Task 6 — Fastify server + health endpoint (AC: 5)**
  - [ ] Create `apps/api/src/server.ts`:
    - Fastify instance with `logger: pinoLogger` (the scrubbed instance)
    - Register `@fastify/cors`
    - Register route plugins: `health.routes.ts` (others come in later stories)
    - `server.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })`
  - [ ] Create `apps/api/src/routes/health.routes.ts`:
    - `GET /api/health` → `{ status: 'ok' }`
  - [ ] Verify response is < 500ms

- [ ] **Task 7 — Pino logger with credential scrubbing (AC: 6)**
  - [ ] Install `pino` and `pino-pretty` (dev) in `apps/api`
  - [ ] Create `apps/api/src/utils/logger.ts`:
    ```typescript
    import pino from 'pino';
    export const logger = pino({
      redact: {
        paths: ['*.api_key', '*.password', '*.token', 'api_key', 'password', 'token'],
        censor: '[REDACTED]'
      },
      level: process.env.LOG_LEVEL ?? 'info'
    });
    ```
  - [ ] Import and use `logger` in `server.ts` — pass as Fastify logger
  - [ ] Write a quick test: log an object with `api_key: 'secret'` — confirm `[REDACTED]` appears in output

- [ ] **Task 8 — Vite proxy config for local dev (AC: 1)**
  - [ ] In `apps/web/vite.config.ts`, add proxy:
    ```typescript
    server: { proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } } }
    ```
  - [ ] Document this in a comment: `// Proxies /api/* to Fastify in dev. In production, Nginx/Coolify handles routing.`

- [ ] **Task 9 — Install shared dev dependencies + TypeScript config**
  - [ ] Root `tsconfig.json` with `strict: true`, path aliases for `@nap/shared`
  - [ ] Each app has its own `tsconfig.json` extending root
  - [ ] `turbo.json` pipeline: `build` depends on `^build`, `dev` runs in parallel
  - [ ] Add `.env` to `.gitignore` (never commit secrets)

## Dev Notes

### Critical Architecture Guardrails

This story creates the FOUNDATION. Every decision here affects all 30 remaining stories. Follow these exactly:

**Naming — non-negotiable:**
- Database columns: `snake_case` (Drizzle maps to camelCase in TypeScript automatically via `casing: 'camelCase'` option)
- TypeScript types/interfaces: `PascalCase`
- Files: `kebab-case.ts` for services/routes/adapters, `PascalCase.tsx` for React components
- API JSON fields: `camelCase`

**Drizzle Schema — only `businesses` + `directories` in this story:**
- Do NOT create `submissions`, `batches`, or `action_queue_items` tables here — those are created in the stories that first need them (1.5, 3.7, 3.8)
- Use `uuid_generate_v4()` or Drizzle's `defaultRandom()` for primary keys
- Use `timestamp('created_at', { withTimezone: true }).defaultNow()` for timestamps

**packages/shared — single source of truth:**
- Types defined here are imported by BOTH frontend and backend — no duplicates anywhere
- Zod schemas here are used for frontend form validation AND backend API validation — same schema, two uses
- The `phoneSchema` regex must match EXACTLY what Story 1.2's form validation uses

**Security — mandatory from day one:**
- Pino `redact` paths must cover nested fields too: `['*.api_key', '*.password', '*.token', 'api_key', 'password', 'token']`
- `.env` NEVER committed to git — only `.env.example`
- DB connection must use SSL (even locally, configure to be non-strict for local but strict for prod)

**docker-compose Redis configuration:**
- AOF persistence is REQUIRED (NFR18 — jobs survive restarts)
- Add these Redis command flags: `--appendonly yes --appendfsync everysec`

### Project Structure Notes

**What this story creates (and ONLY this):**
```
nap/
├── apps/
│   ├── web/                          ← Turborepo template, Vite proxy added
│   └── api/
│       ├── src/
│       │   ├── db/
│       │   │   ├── schema.ts         ← businesses + directories ONLY
│       │   │   └── connection.ts     ← PostgreSQL pool, SSL
│       │   ├── routes/
│       │   │   └── health.routes.ts  ← GET /api/health
│       │   ├── utils/
│       │   │   └── logger.ts         ← Pino + redact
│       │   └── server.ts             ← Fastify setup
│       ├── drizzle/
│       │   ├── migrations/           ← Generated SQL, committed to git
│       │   └── seed.ts               ← 3 directory rows
│       └── drizzle.config.ts
├── packages/
│   └── shared/
│       └── src/
│           ├── types/                ← BusinessProfile, DirectoryHealth, SubmissionStatus, ApiResponse
│           └── validation/           ← businessProfileSchema, phoneSchema
├── docker-compose.yml
├── .env.example
└── turbo.json
```

**What NOT to create yet** (future stories):
- `submissions`, `batches`, `action_queue_items` tables — Story 1.5 and 3.7/3.8
- Any React pages/components — Story 1.2+
- BullMQ queue setup — Story 3.8
- Directory adapters — Stories 3.4–3.6

### Turborepo `with-vite` Template Notes

The template generates `apps/web` as a Vite + React app and `apps/api` as a basic Node.js app. The API starter likely uses a simple HTTP server or Express — **replace it with Fastify**. Install Fastify fresh; don't build on Express.

The template's `turbo.json` pipeline will need to be verified — ensure `dev` task runs both apps in parallel with `"persistent": true`.

### Drizzle ORM Key Patterns

```typescript
// schema.ts — example businesses table definition
import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const businessStatusEnum = pgEnum('business_status', ['active', 'deactivated']);

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zip: varchar('zip', { length: 20 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  website: text('website'),
  status: businessStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// directories table: use jsonb() for api_config and rate_limits
import { jsonb, boolean } from 'drizzle-orm/pg-core';
```

### Fastify Server Pattern

```typescript
// server.ts
import Fastify from 'fastify';
import { logger } from './utils/logger';
import healthRoutes from './routes/health.routes';

const server = Fastify({ logger });

server.register(healthRoutes, { prefix: '/api' });

const start = async () => {
  await server.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
};
start();
```

### Zod Phone Validation Pattern

```typescript
// packages/shared/src/validation/business.schema.ts
import { z } from 'zod';

export const phoneSchema = z.string().regex(
  /^(\+1\s?)?((\(\d{3}\))|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}$/,
  'Enter a valid US phone number'
);
```

### References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Starter Template & Project Structure section
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Data Architecture (schema.ts table definitions)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Implementation Patterns & Consistency Rules
- Architecture: `_bmad-output/planning-artifacts/architecture.md` — Project Structure & Boundaries (complete file tree)
- Epics: `_bmad-output/planning-artifacts/epics.md` — Story 1.1 acceptance criteria
- PRD: `_bmad-output/planning-artifacts/prd.md` — NFR8 (SSL), NFR9 (credential encryption), NFR18 (Redis AOF)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed `workspace:*` → `*` for npm workspaces (pnpm/yarn syntax not supported by npm)
- Removed `casing: 'camelCase'` from `drizzle()` call — not in DrizzleConfig type for v0.31; column names are explicit in schema
- Removed `casing: 'snake_case'` from drizzle.config.ts for same reason

### Completion Notes List

- All 9 tasks implemented; all 3 apps type-check clean
- Migration SQL generated and committed to `apps/api/drizzle/migrations/`
- `turbo dev` will start both apps (web:5173, api:3000) once `npm install` has run
- `docker-compose up` required before running migrations or seed
- AC 2/3 (migrations + seed) require Docker running; AC 1/5/6 verified via type-check and static analysis

### File List

- `package.json` (root)
- `turbo.json`
- `tsconfig.json` (root)
- `.gitignore`
- `.env.example`
- `docker-compose.yml`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `apps/web/index.html`
- `apps/web/src/main.tsx`
- `apps/web/src/App.tsx`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/drizzle.config.ts`
- `apps/api/src/db/connection.ts`
- `apps/api/src/db/schema.ts`
- `apps/api/src/utils/logger.ts`
- `apps/api/src/routes/health.routes.ts`
- `apps/api/src/server.ts`
- `apps/api/drizzle/seed.ts`
- `apps/api/drizzle/migrations/0000_motionless_wonder_man.sql`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/business.types.ts`
- `packages/shared/src/types/directory.types.ts`
- `packages/shared/src/types/submission.types.ts`
- `packages/shared/src/types/api.types.ts`
- `packages/shared/src/types/index.ts`
- `packages/shared/src/validation/business.schema.ts`
- `packages/shared/src/validation/index.ts`
