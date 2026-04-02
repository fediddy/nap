---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-05'
inputDocuments: [product-brief-nap-2026-02-15.md, prd.md, ux-design-specification.md]
workflowType: 'architecture'
project_name: 'nap'
user_name: 'Fediddy'
date: '2026-03-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
36 FRs across 7 capability areas. Architecturally, these map to 4 primary subsystems:
1. **Data Management** (FR1-FR11) — Business profile CRUD, CSV import, validation, change detection
2. **Submission Engine** (FR12-FR18) — Preview, approval, queued submission, rate limiting, retry
3. **Lifecycle Management** (FR19-FR24) — Update propagation, listing removal, per-directory overrides
4. **Monitoring & Reporting** (FR25-FR36) — Dashboard, action queue, detail views, health monitoring, export

**Non-Functional Requirements:**
23 NFRs across 5 categories. Architecture-shaping NFRs:
- **Performance:** Page load < 3s, SPA navigation < 500ms, CSV import (100 rows) < 30s
- **Reliability:** Auto-retry with backoff, no silent failures, jobs persist across restarts, health monitoring with auto-pause
- **Scalability:** 1,000 business profiles, 5,000 pending jobs, new directories without schema changes
- **Security:** Network-level access restriction, encrypted DB connections, encrypted credential storage
- **Integration:** Independent directory operations, per-directory rate limits, configurable timeouts

**Scale & Complexity:**

- Primary domain: Full-stack web (SPA + REST API + background workers)
- Complexity level: Low-medium
- Estimated architectural components: 6

### Technical Constraints & Dependencies

| Constraint | Source | Architectural Impact |
|-----------|--------|---------------------|
| Two-VPS architecture | User requirement | App VPS (SPA + API + Redis) ↔ DB VPS (PostgreSQL). Requires secure inter-VPS networking. |
| Coolify deployment | User requirement | Docker-based deployments, Coolify MCP for provisioning. Shapes CI/CD pipeline. |
| React + Vite frontend | AeliseIntelligence alignment | SPA framework choice locked. Aligns with existing codebase. |
| Node.js backend | AeliseIntelligence alignment | Backend runtime locked. Express or Fastify for REST API. |
| BullMQ + Redis | PRD specification | Job queue technology locked. Requires Redis persistence config. |
| PostgreSQL | PRD specification | Database locked. Requires schema design for extensible directory model. |
| No authentication (MVP) | PRD specification | Network-level access control only. Simplifies API layer. |
| Page-load refresh | PRD specification | No WebSocket/SSE infrastructure needed. Simplifies frontend state. |

### Cross-Cutting Concerns Identified

1. **Rate Limiting Engine** — Per-directory daily caps enforced across submit, update, and remove operations. Shared logic across all job types.
2. **Dual-Track Error Handling** — Auto-retry for transient failures (HTTP 429, 500, timeouts) vs. immediate surfacing for permanent failures (validation errors, auth failures). Every job must resolve to one track.
3. **Status Matrix** — The business × directory status grid is the central data structure. Dashboard, detail views, action queue, batch views, and export are all projections of this matrix.
4. **Data Validation Pipeline** — Validation at import (format, completeness, duplicates) AND pre-submission (directory-specific requirements). Two gates, shared validation logic.
5. **Credential Security** — Directory API keys stored encrypted, never in logs or client code. Scrubbing logic needed in logging layer.
6. **Health Monitoring** — Continuous directory health checks with auto-pause threshold. Affects job scheduling across all operation types.

## Starter Template & Project Structure

### Primary Technology Domain

Full-stack web application: React SPA frontend + Node.js REST API backend + BullMQ background workers. All TypeScript.

### Project Structure: Turborepo Monorepo

**Decision:** Monorepo using Turborepo for project organization.

**Rationale:**
- Frontend and backend share types heavily (business profiles, directory statuses, submission plans, API contracts)
- Single repo = single git push = coordinated Coolify deployment
- `packages/shared` prevents type drift between frontend and backend
- Lightweight tooling — Turborepo is a task runner, not a framework

**Initialization Command:**

```bash
npx create-turbo@latest nap --example with-vite
```

### Project Layout

```
nap/
├── apps/
│   ├── web/                    # React + Vite SPA (frontend)
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Dashboard, Import, Businesses, Directories, Export
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── api/            # API client functions
│   │   │   └── utils/          # Frontend utilities
│   │   ├── index.html
│   │   └── vite.config.ts
│   └── api/                    # Node.js REST API + BullMQ workers (backend)
│       ├── src/
│       │   ├── routes/         # Fastify route handlers
│       │   ├── services/       # Business logic layer
│       │   ├── integrations/   # Directory adapter plugins
│       │   ├── queue/          # BullMQ job definitions and workers
│       │   ├── db/             # Drizzle ORM schema and queries
│       │   └── utils/          # Backend utilities
│       └── Dockerfile
├── packages/
│   └── shared/                 # Shared types, validation schemas (Zod)
│       ├── src/
│       │   ├── types/          # Business, Directory, Submission, Status types
│       │   └── validation/     # Zod schemas for CSV import, profile data
│       └── package.json
├── turbo.json
├── package.json
└── docker-compose.yml          # Local dev: PostgreSQL + Redis
```

### Architectural Decisions Provided by Structure

**Language & Runtime:** TypeScript strict mode throughout — frontend, backend, shared packages

**Styling Solution:** Tailwind CSS (aligns with AeliseIntelligence patterns, Shadcn/UI compatible)

**ORM:** Drizzle ORM — lightweight, TypeScript-native, excellent PostgreSQL support, no code generation step

**Validation:** Zod in `packages/shared` — same validation schemas used in frontend forms AND backend API validation

**Queue:** BullMQ in `apps/api` — job definitions, workers, and scheduling logic

**API Framework:** Fastify — built-in schema validation, TypeScript-native, faster JSON serialization

**Testing:** Vitest (native Vite integration, same config for frontend and backend)

**Dev Experience:** `turbo dev` runs both apps simultaneously, hot reload on both

## Core Architectural Decisions

### Data Architecture

**Database Schema — 5 Core Tables:**

```
businesses          — id, name, address, phone, category, website, status, created_at, updated_at
directories         — id, name, slug, api_config (JSONB), rate_limits (JSONB), health_status, paused, created_at
submissions         — id, business_id (FK), directory_id (FK), batch_id (FK), status, external_id,
                      directory_business_name, last_verified, error_message, retry_count, created_at, updated_at
batches             — id, csv_filename, import_date, business_count, status
action_queue_items  — id, submission_id (FK), reason, suggested_action, status, created_at, resolved_at
```

**Key design decisions:**
- `directories.api_config` is JSONB — adding a new directory = inserting a row, not a migration (NFR13)
- `submissions.directory_business_name` supports per-directory name overrides (FR21)
- `submissions` table IS the status matrix — all dashboard views are projections of this table
- `action_queue_items` links back to submissions for full context

**ORM Migration:** Drizzle Kit with migration files checked into git. Run on deploy via Coolify.

**Caching:** No application-level cache for MVP. TanStack Query handles frontend caching with stale-while-revalidate. PostgreSQL handles the query load at 1,000 profiles.

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | None (MVP) | Internal tool, network-restricted |
| API credential storage | Coolify environment secrets | Encrypted at rest, injected at runtime |
| DB connection | SSL/TLS enforced | Encrypted transit between VPS 1 ↔ VPS 2 |
| Logging | Pino with credential scrubbing | Strips api_key, password, token fields before output |

### API & Communication Patterns

**Framework:** Fastify with Zod schema validation plugin

**Route Structure:**

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/businesses | List all (with filters) |
| POST | /api/businesses | Create single |
| POST | /api/businesses/import | CSV bulk import |
| PUT | /api/businesses/:id | Update single |
| PATCH | /api/businesses/bulk | Bulk update |
| DELETE | /api/businesses/:id | Deactivate |
| GET | /api/submissions | Status matrix (filtered) |
| POST | /api/submissions/plan | Generate submission plan preview |
| POST | /api/submissions/execute | Approve and queue |
| POST | /api/submissions/push-updates | Push profile changes to directories |
| GET | /api/directories | List all with health |
| POST | /api/directories | Add new directory |
| GET | /api/action-queue | Items needing attention |
| POST | /api/action-queue/:id/resolve | Mark resolved |
| GET | /api/dashboard/summary | Aggregate counts |
| GET | /api/export/csv | Full data export |

**Error Response Format:**
```json
{ "error": true, "code": "VALIDATION_ERROR", "message": "Human-readable message", "details": [] }
```

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | React Router v7 | Standard SPA routing |
| Server state | TanStack Query | API caching, refetch on load, perfect for refresh model |
| Client state | Local component state only | TanStack Query handles 95% — no global store needed for MVP |
| Component library | Shadcn/UI + Tailwind | Accessible, copy-paste components, AeliseIntelligence alignment |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Docker | Multi-stage Dockerfile for API; static build for frontend | Optimized images |
| Redis persistence | AOF (Append-Only File) | Jobs survive restarts (NFR18) |
| PostgreSQL backups | Coolify-managed daily dumps | Automated, point-in-time recovery |
| Environment config | .env files + Coolify secrets injection | Secure, per-environment |
| Logging | Pino → structured JSON → stdout | Coolify captures, credential scrubbing |
| Health checks | /api/health endpoint + scheduled BullMQ jobs | Coolify monitoring + directory health |

### Directory Adapter Pattern

**The critical extensibility pattern (NFR14, NFR20):**

```typescript
interface DirectoryAdapter {
  name: string;
  submit(business: BusinessProfile): Promise<SubmissionResult>;
  update(business: BusinessProfile, externalId: string): Promise<SubmissionResult>;
  remove(externalId: string): Promise<RemovalResult>;
  checkHealth(): Promise<HealthStatus>;
}
```

- New directory = new file in `apps/api/src/integrations/` + row in `directories` table
- No changes to existing code required
- Rate limiting handled by queue layer, not adapter — each directory has its own BullMQ queue with rate config from `directories` table
- Adapters are isolated — failure in one never affects others (NFR20)

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (Turborepo + Dockerfile + docker-compose)
2. Database schema + Drizzle ORM setup
3. Shared types + Zod validation schemas
4. Fastify API routes (business CRUD first)
5. CSV import + validation pipeline
6. BullMQ queue infrastructure + first directory adapter
7. Frontend dashboard shell + TanStack Query integration
8. Submission workflow (preview → approve → queue)
9. Status matrix views + action queue
10. Directory health monitoring

**Cross-Component Dependencies:**
- `packages/shared` types must be defined before frontend or backend work
- Database schema must exist before API routes
- Queue infrastructure must exist before directory adapters process jobs
- At least one directory adapter needed before submission workflow can be tested end-to-end

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (snake_case):**
- Tables: `businesses`, `directories`, `submissions`, `batches`, `action_queue_items`
- Columns: `business_id`, `created_at`, `health_status`, `api_config`
- Foreign keys: `business_id`, `directory_id`, `batch_id`
- Indexes: `idx_submissions_business_id`, `idx_submissions_status`

**API (camelCase in JSON):**
- Routes: `/api/businesses`, `/api/action-queue`, `/api/dashboard/summary`
- JSON fields: `{ businessName, phoneNumber, healthStatus, createdAt }`
- Query params: `?status=active&directoryId=3&batchId=5`

**Code (camelCase variables, PascalCase types/components):**
- Files: `business.service.ts`, `bing-places.adapter.ts`, `BusinessList.tsx`
- Components: `<BusinessList />`, `<ActionQueue />`, `<SubmissionPlan />`
- Functions: `getBusinessById()`, `validateCsvRow()`, `submitToDirectory()`
- Types: `BusinessProfile`, `SubmissionStatus`, `DirectoryAdapter`
- Constants: `MAX_RETRY_COUNT`, `DEFAULT_DAILY_CAP`

### Structure Patterns

**Tests: Co-located with source files**
```
src/services/business.service.ts
src/services/business.service.test.ts
```

**Components: Feature-based organization**
```
src/pages/Dashboard/          — Dashboard page + subcomponents
src/pages/Businesses/         — Business list, detail, import
src/pages/Directories/        — Directory registry
src/components/shared/        — Reusable components (StatusBadge, DataTable)
```

**Backend services: One file per domain concept**
```
src/services/business.service.ts      — Business CRUD logic
src/services/submission.service.ts    — Submission planning + execution
src/services/import.service.ts        — CSV parsing + validation
src/services/health.service.ts        — Directory health monitoring
```

**Directory adapters: One file per directory**
```
src/integrations/bing-places.adapter.ts
src/integrations/facebook-business.adapter.ts
src/integrations/yelp.adapter.ts
src/integrations/index.ts              — Adapter registry (exports map)
```

### Format Patterns

**API Success Response:**
```json
{ "data": { }, "meta": { "count": 42 } }
```

**API Error Response:**
```json
{ "error": true, "code": "VALIDATION_ERROR", "message": "Phone number format invalid", "details": [{ "field": "phone", "issue": "Missing area code" }] }
```

**Dates:** ISO 8601 strings in JSON (`"2026-03-04T08:15:00Z"`), `timestamp with time zone` in PostgreSQL

**Null handling:** Return `null` for missing optional fields, never `undefined` in JSON. Omit fields that don't apply rather than sending empty strings.

**Status enums (shared in packages/shared):**
```typescript
type BusinessStatus = 'active' | 'deactivated';
type SubmissionStatus = 'queued' | 'submitting' | 'submitted' | 'verified' | 'failed' | 'requires_action' | 'removed';
type DirectoryHealth = 'healthy' | 'degraded' | 'down' | 'paused';
```

### Process Patterns

**Error Handling — Dual Track:**
- Transient errors (HTTP 429, 500, ETIMEDOUT): BullMQ auto-retries up to 3 times with exponential backoff. If all retries fail → create `action_queue_item` with reason.
- Permanent errors (400, 401, 403, validation failures): No retry → immediately create `action_queue_item` with reason + suggested action.

**Loading States (Frontend):**
TanStack Query handles loading states. Components use `isLoading` → skeleton loader (not spinner), `isError` → error message with retry button, `data` → render content.

**Logging Levels:**
- ERROR: Failed submissions, adapter errors, unhandled exceptions
- WARN: Rate limit hits, health degradation, retry attempts
- INFO: Successful submissions, batch imports, health status changes
- DEBUG: API request/response details (credentials scrubbed)

### Enforcement Guidelines

**All AI agents MUST:**
1. Use the naming conventions defined above — no exceptions
2. Place new directory adapters in `apps/api/src/integrations/` implementing `DirectoryAdapter`
3. Use Zod schemas from `packages/shared` for ALL data validation
4. Return API responses in the standard wrapper format (`{ data, meta }` or `{ error, code, message, details }`)
5. Use the dual-track error handling pattern for all queue jobs
6. Write tests co-located with source files using Vitest
7. Never log raw API credentials — use the Pino scrubber

## Project Structure & Boundaries

### Complete Project Directory Structure

```
nap/
├── apps/
│   ├── web/                                        # React + Vite SPA
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── client.ts                       # Axios/fetch wrapper with base URL, error interceptor
│   │   │   │   ├── businesses.api.ts               # FR1-FR7: Business CRUD API calls
│   │   │   │   ├── import.api.ts                   # FR8-FR11: CSV upload + validation API calls
│   │   │   │   ├── submissions.api.ts              # FR12-FR18: Plan, execute, status API calls
│   │   │   │   ├── directories.api.ts              # FR31-FR34: Directory registry API calls
│   │   │   │   ├── action-queue.api.ts             # FR25-FR30: Action queue API calls
│   │   │   │   ├── dashboard.api.ts                # FR25: Dashboard summary API call
│   │   │   │   └── export.api.ts                   # FR35-FR36: CSV export API call
│   │   │   ├── components/
│   │   │   │   └── shared/
│   │   │   │       ├── StatusBadge.tsx              # Reusable status indicator (green/yellow/red)
│   │   │   │       ├── DataTable.tsx                # Reusable sortable/filterable table
│   │   │   │       ├── ConfirmDialog.tsx            # Reusable confirmation modal
│   │   │   │       ├── ErrorMessage.tsx             # Standardized error display with retry
│   │   │   │       ├── SkeletonLoader.tsx           # Loading state skeleton
│   │   │   │       └── Layout.tsx                   # App shell with nav sidebar
│   │   │   ├── hooks/
│   │   │   │   ├── useBusinesses.ts                # TanStack Query hooks for business data
│   │   │   │   ├── useSubmissions.ts               # TanStack Query hooks for submission data
│   │   │   │   ├── useDirectories.ts               # TanStack Query hooks for directory data
│   │   │   │   ├── useActionQueue.ts               # TanStack Query hooks for action queue
│   │   │   │   └── useDashboard.ts                 # TanStack Query hook for dashboard summary
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard/
│   │   │   │   │   ├── DashboardPage.tsx           # FR25: Summary bar + health overview
│   │   │   │   │   ├── SummaryBar.tsx              # Aggregate counts (submitted, pending, failed)
│   │   │   │   │   ├── HealthOverview.tsx           # FR29-FR30: Directory health cards
│   │   │   │   │   └── RecentActivity.tsx          # Recent submissions/failures feed
│   │   │   │   ├── Businesses/
│   │   │   │   │   ├── BusinessListPage.tsx         # FR1: List with filters + search
│   │   │   │   │   ├── BusinessDetailPage.tsx       # FR3-FR4: Single business view + edit
│   │   │   │   │   ├── BusinessForm.tsx             # FR2, FR5: Create/edit form
│   │   │   │   │   └── ImportWizardPage.tsx         # FR8-FR11: Upload → validate → fix → preview → approve
│   │   │   │   ├── Submissions/
│   │   │   │   │   ├── SubmissionPlanPage.tsx       # FR12-FR13: Preview submission plan
│   │   │   │   │   ├── StatusMatrixPage.tsx         # FR25-FR26: Business x directory grid
│   │   │   │   │   ├── BatchDetailPage.tsx          # FR27: Per-batch submission tracking
│   │   │   │   │   └── SubmissionDetailPage.tsx     # FR28: Single submission detail + history
│   │   │   │   ├── Directories/
│   │   │   │   │   ├── DirectoryListPage.tsx        # FR31-FR32: Directory registry
│   │   │   │   │   └── DirectoryDetailPage.tsx      # FR33-FR34: Config + health + rate limits
│   │   │   │   ├── ActionQueue/
│   │   │   │   │   └── ActionQueuePage.tsx          # FR25-FR26: Items needing attention
│   │   │   │   └── Export/
│   │   │   │       └── ExportPage.tsx               # FR35-FR36: CSV export with filters
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts                   # Date, phone, status display formatters
│   │   │   │   └── constants.ts                    # Frontend constants (routes, colors)
│   │   │   ├── App.tsx                             # React Router setup, QueryClient provider
│   │   │   ├── main.tsx                            # Entry point
│   │   │   └── index.css                           # Tailwind base imports
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                                        # Node.js Fastify + BullMQ
│       ├── src/
│       │   ├── routes/
│       │   │   ├── business.routes.ts              # FR1-FR7: CRUD + bulk + import endpoints
│       │   │   ├── submission.routes.ts            # FR12-FR18: Plan, execute, push-updates
│       │   │   ├── directory.routes.ts             # FR31-FR34: Directory registry endpoints
│       │   │   ├── action-queue.routes.ts          # FR25-FR26: Queue items + resolve
│       │   │   ├── dashboard.routes.ts             # FR25: Aggregate summary endpoint
│       │   │   ├── export.routes.ts                # FR35-FR36: CSV export endpoint
│       │   │   └── health.routes.ts                # NFR: /api/health for Coolify
│       │   ├── services/
│       │   │   ├── business.service.ts             # FR1-FR7: Business CRUD logic + change detection
│       │   │   ├── import.service.ts               # FR8-FR11: CSV parsing, validation, duplicate detection
│       │   │   ├── submission.service.ts           # FR12-FR18: Plan generation, approval, queue dispatch
│       │   │   ├── update.service.ts               # FR19-FR24: Change detection, propagation, removal
│       │   │   ├── health.service.ts               # FR29-FR30: Directory health checks, auto-pause
│       │   │   └── export.service.ts               # FR35-FR36: CSV generation with filters
│       │   ├── integrations/
│       │   │   ├── index.ts                        # Adapter registry — maps directory slug → adapter
│       │   │   ├── base.adapter.ts                 # DirectoryAdapter interface + shared helpers
│       │   │   ├── bing-places.adapter.ts          # Bing Places API integration
│       │   │   ├── facebook-business.adapter.ts    # Facebook Business API integration
│       │   │   └── yelp.adapter.ts                 # Yelp API integration
│       │   ├── queue/
│       │   │   ├── connection.ts                   # Redis/BullMQ connection config
│       │   │   ├── submit.worker.ts                # FR14-FR16: Processes submission jobs
│       │   │   ├── update.worker.ts                # FR19-FR20: Processes update propagation jobs
│       │   │   ├── remove.worker.ts                # FR22-FR23: Processes listing removal jobs
│       │   │   ├── health-check.worker.ts          # FR29-FR30: Scheduled directory health checks
│       │   │   └── queue.service.ts                # Queue management: add jobs, check status, rate limits
│       │   ├── db/
│       │   │   ├── schema.ts                       # Drizzle ORM table definitions (5 tables)
│       │   │   ├── migrate.ts                      # Migration runner
│       │   │   ├── connection.ts                   # PostgreSQL connection pool (SSL)
│       │   │   └── queries/
│       │   │       ├── business.queries.ts         # Business table queries
│       │   │       ├── submission.queries.ts       # Submission table queries (status matrix)
│       │   │       ├── directory.queries.ts        # Directory table queries
│       │   │       ├── batch.queries.ts            # Batch table queries
│       │   │       └── action-queue.queries.ts     # Action queue table queries
│       │   ├── utils/
│       │   │   ├── logger.ts                       # Pino logger with credential scrubbing
│       │   │   ├── errors.ts                       # App error classes (ValidationError, AdapterError)
│       │   │   └── crypto.ts                       # Credential encryption/decryption helpers
│       │   └── server.ts                           # Fastify app setup, plugin registration, start
│       ├── drizzle/
│       │   └── migrations/                         # Generated migration SQL files
│       ├── drizzle.config.ts
│       ├── Dockerfile                              # Multi-stage: build → production
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                                     # Shared types + validation
│       ├── src/
│       │   ├── types/
│       │   │   ├── business.types.ts               # BusinessProfile, BusinessStatus
│       │   │   ├── directory.types.ts              # DirectoryConfig, DirectoryHealth
│       │   │   ├── submission.types.ts             # SubmissionStatus, SubmissionPlan, SubmissionResult
│       │   │   ├── batch.types.ts                  # BatchStatus, BatchSummary
│       │   │   ├── action-queue.types.ts           # ActionQueueItem, SuggestedAction
│       │   │   ├── api.types.ts                    # ApiResponse, ApiError, PaginationMeta
│       │   │   └── index.ts                        # Re-exports all types
│       │   ├── validation/
│       │   │   ├── business.schema.ts              # Zod: business profile validation
│       │   │   ├── import.schema.ts                # Zod: CSV row validation, column mapping
│       │   │   ├── directory.schema.ts             # Zod: directory config validation
│       │   │   └── index.ts                        # Re-exports all schemas
│       │   └── index.ts                            # Package entry point
│       ├── tsconfig.json
│       └── package.json
│
├── .env.example                                    # Template: DB URL, Redis URL, API keys
├── .gitignore
├── docker-compose.yml                              # Local dev: PostgreSQL + Redis containers
├── turbo.json                                      # Turborepo pipeline config
├── package.json                                    # Root workspace config
└── README.md
```

### Architectural Boundaries

**API Boundary (routes/ layer):**
- Handles HTTP request/response only — parsing, validation, serialization
- Calls service layer for all business logic
- Never accesses database or queue directly
- Returns standard `{ data, meta }` or `{ error, code, message, details }` format

**Service Boundary (services/ layer):**
- Contains all business logic and orchestration
- Calls query layer for database access, queue layer for job dispatch
- Never handles HTTP concerns (request objects, status codes)
- Services can call other services for cross-domain operations

**Integration Boundary (integrations/ layer):**
- Each adapter is fully isolated — owns its own API calls, error mapping, response parsing
- Adapters never access database directly — receive data from workers
- Adapter failures are caught and mapped to standard error types
- New directory = new file + registry entry, zero changes to existing code

**Data Boundary (db/ layer):**
- All database access goes through `db/queries/` — no raw SQL in services or routes
- Schema defined once in `db/schema.ts`, types derived from schema
- Migrations managed by Drizzle Kit, checked into git
- Connection pooling managed in `db/connection.ts`

**Queue Boundary (queue/ layer):**
- Workers are the only code that calls directory adapters
- Job data is serializable (IDs + minimal payload, not full objects)
- Rate limiting enforced at queue level per-directory
- Workers create `action_queue_items` for failures that exhaust retries

### FR Category to Structure Mapping

| FR Category | Frontend Pages | Backend Services | Backend Routes | Database Tables |
|-------------|---------------|-----------------|----------------|-----------------|
| Business Profile Management (FR1-FR7) | BusinessListPage, BusinessDetailPage, BusinessForm | business.service.ts | business.routes.ts | businesses |
| Data Import & Validation (FR8-FR11) | ImportWizardPage | import.service.ts | business.routes.ts (import endpoint) | businesses, batches |
| Directory Submission (FR12-FR18) | SubmissionPlanPage | submission.service.ts | submission.routes.ts | submissions, batches |
| Update & Propagation (FR19-FR24) | BusinessForm (change detection) | update.service.ts | submission.routes.ts (push-updates) | submissions |
| Monitoring & Dashboard (FR25-FR30) | DashboardPage, StatusMatrixPage, ActionQueuePage, BatchDetailPage | health.service.ts | dashboard.routes.ts, action-queue.routes.ts | submissions, action_queue_items |
| Directory Registry (FR31-FR34) | DirectoryListPage, DirectoryDetailPage | (CRUD via routes) | directory.routes.ts | directories |
| Reporting & Export (FR35-FR36) | ExportPage | export.service.ts | export.routes.ts | all tables (read) |

### Data Flow

```
CSV File
  → ImportWizardPage (upload, client-side preview)
    → POST /api/businesses/import
      → import.service.ts (parse, validate against Zod schemas, detect duplicates)
        → business.queries.ts (bulk insert to businesses table, create batch record)
          → Response: validation results + created business IDs

User reviews submission plan
  → SubmissionPlanPage (select businesses + directories)
    → POST /api/submissions/plan
      → submission.service.ts (generate plan: which businesses → which directories, skip existing)
        → Response: submission plan preview (counts, estimated time)

User approves plan
  → POST /api/submissions/execute
    → submission.service.ts (create submission records, dispatch to BullMQ)
      → queue.service.ts (add jobs per-directory queue, respecting rate limits)
        → submit.worker.ts picks up jobs
          → adapter (bing-places/facebook/yelp) makes external API call
            → Success: update submission status → 'submitted'
            → Transient failure: BullMQ retries (3x exponential backoff)
            → Permanent failure: create action_queue_item
            → All retries exhausted: create action_queue_item

Dashboard polls on page load
  → GET /api/dashboard/summary
    → Aggregates from submissions table: counts by status, by directory, by batch
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are fully compatible. Turborepo + Vite + React + Fastify + Drizzle + BullMQ + Zod are all TypeScript-native with no version conflicts. Fastify's Zod plugin integrates directly with shared validation schemas. Drizzle's type inference from schema eliminates manual type sync with `packages/shared`.

**Pattern Consistency:** Naming conventions are coherent across layers — snake_case in PostgreSQL columns map through Drizzle's camelCase mode to camelCase API responses and PascalCase TypeScript types. File naming (`*.service.ts`, `*.adapter.ts`, `*.routes.ts`) creates predictable project navigation.

**Structure Alignment:** Monorepo structure directly supports shared types via `packages/shared`. Co-located tests align with Vitest configuration. The `integrations/` directory + adapter interface pattern enables the extensibility requirement without architectural changes.

### Requirements Coverage Validation

**Functional Requirements (36/36 covered):**
- FR1-FR7 (Business Profile Management): `business.service.ts` + `business.routes.ts` + `BusinessListPage`/`BusinessDetailPage`
- FR8-FR11 (Data Import): `import.service.ts` + `ImportWizardPage` with Zod validation from `packages/shared`
- FR12-FR18 (Directory Submission): `submission.service.ts` + `queue/submit.worker.ts` + adapter pattern
- FR19-FR24 (Update & Propagation): `update.service.ts` + `queue/update.worker.ts` + `queue/remove.worker.ts`
- FR25-FR30 (Monitoring & Dashboard): `DashboardPage` + `StatusMatrixPage` + `ActionQueuePage` + `health.service.ts`
- FR31-FR34 (Directory Registry): `directory.routes.ts` + `DirectoryListPage`/`DirectoryDetailPage`
- FR35-FR36 (Reporting & Export): `export.service.ts` + `ExportPage`

**Non-Functional Requirements (23/23 addressed):**
- Performance (NFR1-6): TanStack Query caching, page-load refresh model, Fastify JSON serialization
- Security (NFR7-10): Pino credential scrubbing, SSL/TLS DB connections, Coolify secrets injection, no auth needed (network-restricted)
- Scalability (NFR11-14): JSONB directory config (no migrations for new directories), per-directory BullMQ queues, 1K profile target within PostgreSQL capacity
- Reliability (NFR15-19): BullMQ retries with exponential backoff, Redis AOF persistence, dual-track error handling, action queue for unresolved failures
- Integration (NFR20-23): Isolated adapters, per-directory rate limits in queue config, configurable timeouts per adapter

### Implementation Readiness Validation

**Decision Completeness:** All critical decisions documented with specific technology choices. Implementation patterns include concrete examples for naming, file structure, error handling, and API response formats. Enforcement guidelines provide clear rules for AI agents.

**Structure Completeness:** Every file in the project tree has a purpose annotation and FR mapping. Architectural boundaries define what each layer can and cannot do. Integration points are explicit (routes → services → queries/queue → adapters).

**Pattern Completeness:** Dual-track error handling covers all failure modes. Loading states, logging levels, date formats, null handling, and status enums are all specified. No ambiguous implementation decisions remain.

### Gap Analysis Results

**Critical Gaps:** None identified.

**Minor Gaps:**
- No seed script for initial directory records (Bing Places, Facebook Business, Yelp) — add `drizzle/seed.ts` during scaffolding
- No explicit CORS configuration mentioned — needed since SPA and API may run on different ports in dev (Vite proxy handles this, document in `vite.config.ts`)

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with technology choices
- [x] Technology stack fully specified
- [x] Integration patterns defined (adapter pattern)
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established (DB, API, code)
- [x] Structure patterns defined (co-located tests, feature pages, one-service-per-domain)
- [x] Communication patterns specified (routes → services → queries)
- [x] Process patterns documented (dual-track errors, loading states, logging)

**Project Structure**
- [x] Complete directory structure defined with FR annotations
- [x] Component boundaries established (5 layers)
- [x] Integration points mapped (data flow diagram)
- [x] Requirements to structure mapping complete (FR mapping table)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all 36 FRs and 23 NFRs have explicit architectural support with no unresolved conflicts.

**Key Strengths:**
- Adapter pattern makes adding directories trivial (new file + DB row)
- BullMQ per-directory queues solve rate limiting without custom logic
- Shared Zod schemas prevent frontend/backend validation drift
- Status matrix (submissions table) is a single source of truth for all dashboard views

**Areas for Future Enhancement:**
- WebSocket/SSE for real-time dashboard updates (post-MVP)
- Authentication layer when/if multi-user access needed
- Redis caching layer if PostgreSQL query load becomes a bottleneck at scale
- E2E test infrastructure (Playwright) for critical workflows

**First Implementation Priority:**
```bash
npx create-turbo@latest nap --example with-vite
```
Then: database schema → shared types → API routes → queue infrastructure → frontend shell
