---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments: [prd.md, architecture.md, ux-design-specification.md]
---

# nap - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for nap, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Operator can create an individual business profile with name, address, phone number, business category, and website URL
- FR2: Operator can bulk-import business profiles via CSV file upload
- FR3: Operator can edit any field of an existing business profile
- FR4: Operator can bulk-update existing business profiles via CSV re-import with automatic matching on business name + address
- FR5: Operator can deactivate a business profile to mark it as no longer active
- FR6: Operator can search and filter business profiles by name, category, status, or location
- FR7: Operator can view a complete list of all managed business profiles
- FR8: System can validate imported business data for completeness and format correctness (phone format, address format, required fields present)
- FR9: System can detect duplicate business profiles during import based on business name + address matching
- FR10: Operator can fix validation errors inline during the import preview before any submission occurs
- FR11: System can detect and display changes between re-imported data and existing profiles as a diff view
- FR12: Operator can preview the submission plan for a batch of businesses showing which directories each will be submitted to
- FR13: Operator can approve or reject a submission plan before execution (confirmation gate)
- FR14: System can submit business profile data to integrated directory APIs (Bing Places, Facebook Business, Yelp, + 1 TBD)
- FR15: System can queue submissions with per-directory rate limiting and daily submission caps
- FR16: System can automatically retry failed submissions using a backoff strategy
- FR17: System can pause submissions to a specific directory without affecting submissions to other directories
- FR18: Operator can batch-approve submissions for multiple businesses simultaneously
- FR19: Operator can push profile updates to all directories where a business has active listings
- FR20: System can queue update requests to directories when business profile data changes
- FR21: Operator can override a business name for a specific directory without changing the master profile
- FR22: Operator can initiate listing removal from all directories for deactivated businesses
- FR23: System can automatically remove listings from directories that support delete/unpublish APIs
- FR24: System can flag listings requiring manual removal and provide direct links to each directory listing
- FR25: Operator can view a summary dashboard showing overall system status (total sites managed, fully listed count, pending actions count)
- FR26: Operator can view submission status per business per directory (success, pending, failed, requires action)
- FR27: Operator can view an action queue of items requiring manual intervention, prioritized by urgency
- FR28: Operator can view a per-business detail page showing its complete citation profile across all directories
- FR29: Operator can see last-verified timestamps for each directory listing per business
- FR30: Operator can view batch-level status for recent imports showing progress across all submissions in that batch
- FR31: Operator can view all integrated directories and their current health status
- FR32: System can monitor directory API health and detect degradation or outages
- FR33: System can automatically pause submissions to directories experiencing issues (graceful degradation)
- FR34: Operator can add a new directory to the registry with API configuration details
- FR35: Operator can export all business data and directory statuses to CSV format
- FR36: Operator can view a NAP consistency check for a specific business verifying data matches across all directories

### NonFunctional Requirements

- NFR1: Dashboard initial page load completes within 3 seconds
- NFR2: SPA view-to-view navigation completes within 500ms
- NFR3: CSV import of 100 business profiles completes validation and queuing within 30 seconds
- NFR4: Dashboard data refresh completes within 2 seconds
- NFR5: Action queue view loads within 1 second
- NFR6: Search and filter operations on business profiles return results within 1 second for up to 1,000 profiles
- NFR7: Application access is restricted at the network level — no public-facing access without firewall rules
- NFR8: Database connections between App VPS and Database VPS are encrypted in transit
- NFR9: Directory API credentials are stored encrypted at rest, never exposed in logs or API responses
- NFR10: No sensitive data (API keys, credentials) appears in client-side code or browser storage
- NFR11: System supports managing up to 1,000 business profiles without performance degradation
- NFR12: Job queue handles up to 5,000 pending submission jobs without memory or processing issues
- NFR13: Database schema supports adding new directories without schema migrations
- NFR14: Adding a new directory integration does not require changes to existing integration code
- NFR15: Failed submission jobs retry automatically up to 3 times with exponential backoff before surfacing as manual action items
- NFR16: No silent failures — every failed job produces an actionable entry in the action queue
- NFR17: System can be restored from backup and resume queued jobs without data loss or re-import
- NFR18: Queue processing survives application restarts — pending jobs persist across server reboots
- NFR19: Directory health monitoring detects API failures within 5 consecutive failed requests and automatically pauses submissions
- NFR20: Each directory integration operates independently — failure in one does not block or affect others
- NFR21: Directory API rate limits are respected per-directory with configurable daily submission caps
- NFR22: API responses from directories are logged for debugging without storing sensitive credentials in logs
- NFR23: Directory integrations support configurable timeout values per directory

### Additional Requirements

**From Architecture:**
- Starter Template: Turborepo monorepo via `npx create-turbo@latest nap --example with-vite`
- Database seed script needed: Initial directory records (Bing Places, Facebook, Yelp) via `drizzle/seed.ts`
- CORS configuration: Vite proxy for dev, document in `vite.config.ts`
- Directory Adapter Pattern: Each adapter implements `DirectoryAdapter` interface (submit, update, remove, checkHealth)
- Per-directory BullMQ queues: Rate limiting handled at queue level, not adapter level
- Dual-track error handling: Transient errors (429, 500, timeout) auto-retry; permanent errors (400, 401, 403) immediately surface to action queue
- Drizzle ORM migrations: Checked into git, run on deploy via Coolify
- Docker multi-stage builds: API Dockerfile, static build for frontend
- Redis AOF persistence: Jobs survive restarts
- Pino logger with credential scrubbing: Strips api_key, password, token fields
- Implementation sequence dependency chain: shared types -> schema -> API routes -> queue infra -> adapters -> frontend

**From UX:**
- Fully responsive, desktop-first design: Primary viewport 1280px+, fully functional on tablet (768px+) and mobile (375px+). All features accessible across breakpoints.
- Color-coded status system: Green/yellow/red as primary communication layer
- Progressive disclosure: Summary-first with drill-down at every level
- Skeleton loaders for loading states (not spinners)
- Drag-and-drop CSV import with instant validation
- Batch-aware grouping: Track imports as cohesive batches
- Inline error fixing during import preview
- Confirmation gate with full preview before any submission reaches a directory
- Data diff display on profile updates before propagation

### FR Coverage Map

FR1: Epic 1 - Create individual business profile
FR2: Epic 1 - Bulk CSV import
FR3: Epic 1 - Edit existing business profile
FR4: Epic 2 - Bulk-update via CSV re-import with matching
FR5: Epic 1 - Deactivate business profile
FR6: Epic 1 - Search and filter profiles
FR7: Epic 1 - View all managed profiles
FR8: Epic 2 - Validate imported data
FR9: Epic 2 - Detect duplicates during import
FR10: Epic 2 - Fix validation errors inline
FR11: Epic 2 - Detect/display changes as diff view
FR12: Epic 3 - Preview submission plan
FR13: Epic 3 - Approve/reject plan (confirmation gate)
FR14: Epic 3 - Submit to directory APIs/browser
FR15: Epic 3 - Queue with rate limiting + daily caps
FR16: Epic 3 - Auto-retry with backoff
FR17: Epic 3 - Pause submissions per directory
FR18: Epic 3 - Batch-approve submissions
FR19: Epic 4 - Push updates to all directories
FR20: Epic 4 - Queue update requests on data change
FR21: Epic 4 - Per-directory name override
FR22: Epic 4 - Initiate listing removal
FR23: Epic 4 - Auto-remove from supporting directories
FR24: Epic 4 - Flag manual removal with direct links
FR25: Epic 5 - Summary dashboard
FR26: Epic 5 - Status per business per directory
FR27: Epic 5 - Action queue (prioritized)
FR28: Epic 5 - Per-business citation profile detail
FR29: Epic 5 - Last-verified timestamps
FR30: Epic 5 - Batch-level status tracking
FR31: Epic 6 - View directories + health status
FR32: Epic 6 - Monitor API health + detect issues
FR33: Epic 6 - Auto-pause on degradation
FR34: Epic 6 - Add new directory to registry
FR35: Epic 7 - Export to CSV
FR36: Epic 7 - NAP consistency check

## Epic List

### Epic 1: Project Foundation & Business Profile Management
Operator can create, import, search, edit, and deactivate business profiles. The core data engine is live and all infrastructure is scaffolded.
**FRs covered:** FR1, FR2, FR3, FR5, FR6, FR7
**Notes:** Turborepo scaffold (`npx create-turbo@latest nap --example with-vite`), DB schema + Drizzle ORM, shared types + Zod schemas, seed script (Bing/Facebook/Yelp directory rows), full business CRUD, basic CSV import endpoint.

### Epic 2: Data Import & Validation Engine
Operator can bulk-import via CSV with full validation, duplicate detection, inline error fixing, and change diffing on re-imports.
**FRs covered:** FR4, FR8, FR9, FR10, FR11
**Notes:** Import wizard (upload → validate → fix → preview), Zod validation schemas in `packages/shared`, duplicate matching on name + address, diff view for re-imports.

### Epic 3: Directory Submission Pipeline
Operator can preview a submission plan, approve it, and have businesses automatically submitted to directories via a stealth browser automation engine.
**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17, FR18
**Notes:**
- **Browser stack:** Camoufox (Firefox primary, Juggler protocol, C++ fingerprints), rebrowser-playwright (Chrome fallback), CloakBrowser (Chrome source-level fallback)
- **Fingerprinting:** `@apify/fingerprint-generator` with Firefox statistical profiles
- **Human behavior:** `ghost-cursor-play` (Bezier mouse curves), per-key typing delays with occasional typo
- **Profile management:** `NAPBrowserProfile` — persistent identity per business/directory, aged profile pool pre-warmed with browsing history
- **Session relay:** Cookie + fingerprint handoff across browser engines mid-session
- **Adapters:** Bing Places (file export/spreadsheet), Facebook Business (Camoufox browser), Yelp (Camoufox browser)
- **Dev safety:** `DRY_RUN=true` sandbox mode — adapters return mock `SubmissionResult` without hitting real directories
- **Queue:** BullMQ per-directory queues, rate limiting, exponential backoff retry (3x)

### Epic 4: Update Propagation & Lifecycle Management
Operator can push profile changes to all directories, override names per-directory, deactivate businesses, and remove listings — full bidirectional CRUD on both local data and remote directory listings.
**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24
**Notes:** Change detection engine, update queue workers (`update.worker.ts`, `remove.worker.ts`), per-directory name overrides, automated removal where supported, manual removal guidance with direct links.

### Epic 5: Monitoring Dashboard & Action Queue
Operator can monitor the entire citation portfolio at a glance, drill into failures, and resolve action items in under 5 minutes daily.
**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30
**Notes:** Summary bar, color-coded status matrix (green/yellow/red), prioritized action queue, per-business citation detail page, batch-level tracking, skeleton loaders, fully responsive (desktop-first, mobile-functional).

### Epic 6: Directory Registry & Health Monitoring
Operator can manage directories, see health status, and the system automatically detects degradation and pauses submissions before wasting attempts.
**FRs covered:** FR31, FR32, FR33, FR34
**Notes:** Directory registry UI, health check worker (5 consecutive failure threshold), auto-pause with graceful degradation, add new directory with API/browser config.

### Epic 7: Reporting & Data Export
Operator can export everything to CSV and verify NAP consistency for any business across all directories.
**FRs covered:** FR35, FR36

---

## Epic 1: Project Foundation & Business Profile Management

Operator can create, import, search, edit, and deactivate business profiles. The core data engine is live and all infrastructure is scaffolded.

### Story 1.1: Project Scaffolding & Infrastructure Setup

As an operator,
I want a fully configured monorepo with database, API, and frontend wired together,
So that the development environment is ready and I can immediately start building features.

**Acceptance Criteria:**

**Given** the developer runs `npx create-turbo@latest nap --example with-vite`
**When** setup is complete and `turbo dev` is executed
**Then** both `apps/web` (Vite + React, port 5173) and `apps/api` (Fastify, port 3000) start without errors
**And** `docker-compose up` starts PostgreSQL and Redis containers locally

**Given** the Drizzle schema is defined with the `businesses` and `directories` tables
**When** `npx drizzle-kit migrate` runs
**Then** all tables are created in the database with correct columns and constraints
**And** migration files are checked into `apps/api/drizzle/migrations/`

**Given** the seed script runs (`npx tsx apps/api/drizzle/seed.ts`)
**When** the script completes
**Then** three directory records exist in the `directories` table: Bing Places, Facebook Business, Yelp
**And** each directory has `api_config` JSONB, `rate_limits` JSONB, `health_status = 'healthy'`, and `paused = false`

**Given** the shared package `packages/shared` exists
**When** types are imported in both `apps/web` and `apps/api`
**Then** `BusinessProfile`, `BusinessStatus`, `SubmissionStatus`, `DirectoryHealth` types are available in both apps without duplication
**And** Zod validation schemas for business profile fields are exported from `packages/shared/src/validation/`

**Given** the API is running
**When** `GET /api/health` is called
**Then** response is `200 { status: "ok" }` within 500ms

**Given** Pino logger is configured in `apps/api/src/utils/logger.ts`
**When** any log message is emitted containing `api_key`, `password`, or `token` fields
**Then** those fields are scrubbed from the output and replaced with `[REDACTED]`

---

### Story 1.2: Create Individual Business Profile

As an operator,
I want to create a single business profile by filling in a form,
So that I can add a new lead gen site to the system for future directory submission.

**Acceptance Criteria:**

**Given** the operator navigates to `/businesses/new`
**When** the form renders
**Then** fields are shown for: business name (required), street address (required), city (required), state (required), zip (required), phone number (required), business category (required), website URL (optional)
**And** the form is fully responsive at 375px, 768px, and 1280px viewports

**Given** the operator submits the form with all required fields valid
**When** `POST /api/businesses` is called
**Then** a new record is created in the `businesses` table with `status = 'active'`
**And** the operator is redirected to the business detail page for the new profile
**And** a success toast notification confirms creation

**Given** the operator submits with a missing required field
**When** the form validates
**Then** inline validation errors appear on the specific field(s) without a page reload
**And** no API call is made until the form is valid

**Given** the operator enters a phone number
**When** the Zod schema validates it
**Then** formats accepted: `(555) 555-5555`, `555-555-5555`, `5555555555`, `+15555555555`
**And** invalid formats show: "Enter a valid US phone number"

**Given** the API receives a `POST /api/businesses` request
**When** the business is created
**Then** the response follows `{ data: { id, name, address, phone, category, website, status, createdAt }, meta: {} }`
**And** no validation occurs against directories at this stage

---

### Story 1.3: List, Search & Filter Business Profiles

As an operator,
I want to view, search, and filter all my business profiles in one place,
So that I can quickly find specific businesses and understand my portfolio at a glance.

**Acceptance Criteria:**

**Given** the operator navigates to `/businesses`
**When** the page loads
**Then** all active and deactivated business profiles are displayed in a sortable data table
**And** columns shown: Business Name, Address, Category, Phone, Status, Created Date
**And** the page uses a skeleton loader while data fetches — no spinner

**Given** the operator types in the search field
**When** input changes
**Then** results filter in real-time by business name or address (debounced 300ms)
**And** results return within 1 second for up to 1,000 profiles (NFR6)

**Given** the operator selects a filter value
**When** filtering by Category
**Then** only businesses matching that category are shown
**When** filtering by Status (active / deactivated)
**Then** only businesses with that status are shown
**And** multiple filters can be applied simultaneously

**Given** the operator clicks a column header
**When** the column is sortable
**Then** the table sorts ascending on first click, descending on second click
**And** sort state persists during the current session

**Given** no businesses exist yet
**When** the list page loads
**Then** an empty state is shown with a prompt to import or create the first business

**Given** `GET /api/businesses` is called with query params `?status=active&category=plumber&search=oakland`
**When** the API responds
**Then** only matching records are returned in `{ data: [], meta: { count: N } }` format
**And** response time is under 1 second for 1,000 records (NFR6)

---

### Story 1.4: Edit & Deactivate Business Profile

As an operator,
I want to edit any field on an existing business profile and deactivate businesses I no longer need,
So that I can keep my data accurate and mark dead sites without deleting history.

**Acceptance Criteria:**

**Given** the operator is on a business detail page at `/businesses/:id`
**When** they click "Edit"
**Then** all fields become editable inline or a pre-filled form opens
**And** the current values are pre-populated in every field

**Given** the operator edits one or more fields and clicks "Save"
**When** `PUT /api/businesses/:id` is called
**Then** the record is updated in the `businesses` table with new `updated_at` timestamp
**And** a success toast confirms the update
**And** the detail page reflects the new values immediately via TanStack Query cache invalidation

**Given** the operator edits a field but then clicks "Cancel"
**When** the cancel action fires
**Then** no API call is made and all fields revert to their original values

**Given** the operator clicks "Deactivate" on a business
**When** a confirmation dialog appears
**Then** the dialog clearly states: "This will mark [Business Name] as deactivated. Directory listings will not be removed automatically — use the Lifecycle Management section for that."
**And** the operator must click "Confirm Deactivate" to proceed

**Given** the operator confirms deactivation
**When** `DELETE /api/businesses/:id` is called
**Then** the business `status` is set to `'deactivated'` — the record is NOT deleted
**And** the business still appears in the list with a "Deactivated" status badge (gray)
**And** deactivated businesses cannot be selected for new submission plans

**Given** the operator tries to edit a deactivated business
**When** the edit form opens
**Then** a warning banner shows: "This business is deactivated. Re-activate before submitting to directories."
**And** editing is still permitted to correct data before re-activation

---

### Story 1.5: Basic CSV Bulk Import

As an operator,
I want to upload a CSV file to bulk-import multiple business profiles at once,
So that I can add 10–100 businesses in one action instead of creating them one by one.

**Acceptance Criteria:**

**Given** the operator navigates to `/businesses/import`
**When** the page loads
**Then** a drag-and-drop upload zone is displayed accepting `.csv` files
**And** a "Download Template" link provides a sample CSV with correct column headers: `name, address, city, state, zip, phone, category, website`

**Given** the operator drags a valid CSV onto the upload zone
**When** the file is dropped
**Then** the file is accepted and a preview table shows the parsed rows
**And** the upload zone provides visual feedback (highlight on drag-over, success state on drop)

**Given** the operator uploads a CSV with 100 rows
**When** `POST /api/businesses/import` is called
**Then** all 100 businesses are inserted into the `businesses` table within 30 seconds (NFR3)
**And** a batch record is created in the `batches` table with `csv_filename`, `import_date`, `business_count`, `status = 'imported'`
**And** the operator is shown a success summary: "100 businesses imported successfully"

**Given** the CSV contains rows with missing required fields
**When** the file is parsed on upload
**Then** invalid rows are highlighted in red in the preview table with a reason per row
**And** valid rows are shown in green
**And** the operator can choose to "Import Valid Rows Only" or "Cancel"

**Given** the CSV is not a valid format (wrong delimiter, missing headers)
**When** parsing fails
**Then** an error message clearly states what is wrong: "Missing required column: phone"
**And** no records are inserted

**Given** `POST /api/businesses/import` succeeds
**When** the API responds
**Then** the response includes `{ data: { batchId, imported: N, skipped: N }, meta: {} }`
**And** the operator is redirected to `/businesses` showing the newly imported businesses

---

## Epic 2: Data Import & Validation Engine

Operator can bulk-import via CSV with full validation, duplicate detection, inline error fixing, and change diffing on re-imports.

### Story 2.1: CSV Validation — Format & Completeness Checks

As an operator,
I want the system to validate every row in my CSV before anything is imported,
So that bad data is caught before it reaches a directory submission.

**Acceptance Criteria:**

**Given** the operator uploads a CSV file
**When** the file is parsed by `import.service.ts`
**Then** every row is validated against the Zod schema in `packages/shared/src/validation/import.schema.ts`
**And** validation checks: name (non-empty string), phone (valid US format), address/city/state/zip (non-empty), category (non-empty), website (valid URL or empty)

**Given** a row fails validation
**When** results are returned to the frontend
**Then** each invalid row shows a red badge with the specific error(s): e.g. "Phone: invalid format", "City: required"
**And** valid rows show a green badge
**And** the summary line reads: "X valid, Y invalid — fix errors or import valid rows only"

**Given** the operator clicks "Import Valid Rows Only"
**When** the import executes
**Then** only green rows are inserted — red rows are skipped
**And** the batch record reflects `{ imported: X, skipped: Y }`

**Given** a CSV with 0 valid rows is uploaded
**When** validation completes
**Then** the "Import Valid Rows Only" button is disabled
**And** the message reads: "No valid rows to import — please fix errors and re-upload"

**Given** phone validation runs
**When** the Zod schema checks a phone value
**Then** the same schema used in Story 1.2 (single create form) is reused from `packages/shared` — no duplicate validation logic

---

### Story 2.2: Duplicate Detection During Import

As an operator,
I want the system to detect if I'm importing a business that already exists,
So that I don't end up with duplicate profiles that create duplicate directory submissions.

**Acceptance Criteria:**

**Given** the operator uploads a CSV
**When** `import.service.ts` processes the rows after format validation
**Then** each valid row is checked against existing `businesses` records matching on `name + city + state` (case-insensitive, trimmed)

**Given** a row matches an existing business
**When** the duplicate is detected
**Then** the row is flagged with an orange "Duplicate" badge in the preview table
**And** the existing business name and ID are shown: "Matches: Mike's Plumbing (ID: 42)"
**And** the operator can choose per-row: "Skip" or "Import Anyway"

**Given** the operator selects "Skip" on a duplicate row
**When** the import executes
**Then** that row is not inserted
**And** the batch count reflects it as skipped

**Given** the operator selects "Import Anyway" on a duplicate row
**When** the import executes
**Then** a new business record IS created with `status = 'active'`
**And** a warning is logged: duplicate business created with reference to the existing ID

**Given** a CSV of 50 rows with 5 duplicates
**When** duplicate detection runs
**Then** detection completes within the 30-second total import budget (NFR3)
**And** duplicate checks use a single bulk query — not N individual queries per row

---

### Story 2.3: Inline Error Fixing in Import Preview

As an operator,
I want to fix validation errors directly in the import preview table without re-uploading the file,
So that I can correct small mistakes on the spot and import everything in one session.

**Acceptance Criteria:**

**Given** the import preview table shows rows with validation errors
**When** the operator clicks on an invalid cell
**Then** the cell becomes an inline editable input pre-filled with the bad value
**And** the field highlights in red with the validation error shown below it

**Given** the operator edits an invalid cell
**When** they type a corrected value and press Tab or Enter
**Then** the Zod schema re-validates the field in real-time
**And** if valid: the cell turns green and the row badge updates
**And** if still invalid: the error message updates to reflect the new issue

**Given** the operator fixes all errors on a row
**When** the last field on that row passes validation
**Then** the row badge changes from red to green automatically
**And** the summary count updates: "X valid, Y invalid"

**Given** the operator has fixed errors and clicks "Import All Valid Rows"
**When** the import executes
**Then** the corrected in-memory values (not the original CSV values) are used for insertion
**And** edits made in the preview are NOT written back to the original CSV file

**Given** a row has both a format error and a duplicate flag
**When** the operator fixes the format error
**Then** the duplicate check re-runs on the corrected value
**And** if the corrected value no longer matches any existing business, the duplicate flag is cleared

---

### Story 2.4: Change Detection & Diff View on Re-Import

As an operator,
I want to see exactly what changed when I re-import a CSV with updated business data,
So that I can review and approve changes before they overwrite existing profiles.

**Acceptance Criteria:**

**Given** the operator uploads a CSV where rows match existing businesses (by name + city + state)
**When** `import.service.ts` detects matches
**Then** matched rows are shown in the preview as "Update" rows (blue badge) instead of "New" rows (green badge)

**Given** an "Update" row exists in the preview
**When** the operator clicks "Show Changes" on that row
**Then** a diff view expands showing old value vs new value for every changed field
**And** unchanged fields are not shown in the diff
**And** the diff format is: `Phone: (510) 555-1234 → (510) 555-9999` (old → new, red → green)

**Given** the operator reviews the diff and clicks "Apply Updates"
**When** `PATCH /api/businesses/bulk` is called
**Then** only the changed fields are updated on matching records
**And** `updated_at` timestamps are refreshed
**And** the batch record captures this as an update batch: `{ type: 'update', updated: N }`

**Given** the operator does not want to apply a specific update
**When** they uncheck the row in the preview
**Then** that business is excluded from the bulk update
**And** its existing record remains unchanged

**Given** a re-import CSV has 20 matching businesses but only 8 have actual field changes
**When** change detection runs
**Then** only the 8 changed rows are shown as "Update" badges
**And** the 12 unchanged matches are shown as "No Changes" (gray badge) and excluded from the update by default

**Given** `PATCH /api/businesses/bulk` completes
**When** the API responds
**Then** the response is `{ data: { updated: N, unchanged: M }, meta: {} }`
**And** TanStack Query cache for `/api/businesses` is invalidated so the list reflects changes immediately

---

## Epic 3: Directory Submission Pipeline

Operator can preview a submission plan, approve it, and have businesses automatically submitted to directories via a stealth browser automation engine.

### Story 3.1: Browser Automation Infrastructure & NAPBrowserProfile

As an operator,
I want the system to have a fully configured stealth browser engine ready for directory submissions,
So that submissions look like real human browser sessions and are not blocked by anti-bot systems.

**Acceptance Criteria:**

**Given** the developer installs the browser stack dependencies
**When** `npm install camoufox-js @apify/fingerprint-generator @apify/fingerprint-injector ghost-cursor-play rebrowser-playwright cloakbrowser` runs in `apps/api`
**Then** all packages install without conflicts

**Given** `NAPBrowserProfile` is defined in `apps/api/src/browser/profile.ts`
**When** a new profile is created for a business+directory pair
**Then** it generates a statistically realistic Firefox fingerprint via `@apify/fingerprint-generator` with `{ browsers: [{ name: 'firefox', minVersion: 120 }], devices: ['desktop'], operatingSystems: ['windows'] }`
**And** the profile is persisted to disk at `apps/api/browser-profiles/{businessId}-{directorySlug}.json`
**And** subsequent runs for the same pair load the existing profile — same identity, aged session

**Given** a `NAPBrowserProfile` is loaded
**When** a Camoufox browser context is launched
**Then** the fingerprint is injected via `@apify/fingerprint-injector` before any page navigation
**And** mouse interactions use `ghost-cursor-play` Bezier curves for all clicks
**And** form fills use per-character delays of 40–110ms with 1-in-20 chance of a typo+backspace

**Given** `DRY_RUN=true` is set in the environment
**When** any directory adapter's `submit()` method is called
**Then** it returns a mock `SubmissionResult` with `status: 'submitted', externalId: 'dry-run-xxx'` after a 2-second artificial delay
**And** no real browser is launched
**And** no real directory is contacted

**Given** Camoufox fails to launch (binary not found, crash)
**When** the browser engine catches the error
**Then** it automatically falls back to `rebrowser-playwright`
**And** if that also fails, it falls back to `CloakBrowser`
**And** the fallback chain used is logged at WARN level: "Camoufox failed, falling back to rebrowser-playwright"

---

### Story 3.2: Session Relay & Cookie Handoff

As an operator,
I want the system to maintain persistent browser identities and share session state across browser engines,
So that directory sites see consistent returning users rather than fresh bot sessions.

**Acceptance Criteria:**

**Given** a submission session starts for a business+directory pair
**When** the browser context is initialized
**Then** cookies, localStorage, and the fingerprint UA are loaded from the persisted `NAPBrowserProfile`
**And** the same UA string is used regardless of which browser engine is active

**Given** a submission session completes (success or failure)
**When** the browser context closes
**Then** current cookies and localStorage are written back to the `NAPBrowserProfile` on disk
**And** the profile `lastUsed` timestamp is updated

**Given** the session relay is triggered (switching from Camoufox to rebrowser-playwright mid-session)
**When** the handoff occurs
**Then** cookies are extracted from the source context and injected into the new context
**And** the same fingerprint UA is injected into the new context
**And** a new page is opened to the same URL where the previous context was paused

**Given** a profile has never been used before (new business+directory pair)
**When** the aged profile pool is checked at `apps/api/browser-profiles/pool/`
**Then** if a pre-warmed aged profile exists (has prior cookie history), it is cloned and assigned to this pair
**And** if no aged profiles exist, a fresh profile is created and used

---

### Story 3.3: Directory Adapter Pattern & Base Infrastructure

As an operator,
I want each directory to have its own isolated adapter,
So that a failure or change in one directory never affects submissions to other directories.

**Acceptance Criteria:**

**Given** `base.adapter.ts` defines the `DirectoryAdapter` interface
**When** any new adapter is implemented
**Then** it must implement: `submit(business: BusinessProfile): Promise<SubmissionResult>`, `update(business: BusinessProfile, externalId: string): Promise<SubmissionResult>`, `remove(externalId: string): Promise<RemovalResult>`, `checkHealth(): Promise<HealthStatus>`
**And** the adapter has a `type` field: `'browser' | 'file_export' | 'api'`

**Given** `apps/api/src/integrations/index.ts` exports the adapter registry
**When** a directory slug is looked up (e.g. `'bing-places'`)
**Then** the corresponding adapter instance is returned
**And** adding a new directory requires only: new file in `integrations/` + new row in `directories` table

**Given** an adapter's `submit()` throws an unhandled error
**When** the worker catches it
**Then** the error is mapped to `SubmissionResult { status: 'failed', errorCode: 'ADAPTER_ERROR', message: string }`
**And** the error does NOT propagate to other adapters running in parallel

**Given** `SubmissionStatus` and `SubmissionResult` types are defined in `packages/shared`
**When** both the adapter layer and the frontend import these types
**Then** there is a single source of truth — no duplicate type definitions

---

### Story 3.4: Bing Places Adapter (File Export)

As an operator,
I want the system to generate a Bing Places bulk upload spreadsheet for my businesses,
So that I can upload it directly to the Bing Places dashboard with minimal manual work.

**Acceptance Criteria:**

**Given** the Bing Places adapter's `submit()` is called with a batch of businesses
**When** it executes
**Then** it generates a `.xlsx` file formatted to Bing Places bulk upload template spec (columns: Business Name, Address Line 1, City, State/Province, Postal Code, Country, Phone, Category, Website)
**And** the file is saved to `apps/api/exports/bing-places-{batchId}-{date}.xlsx`
**And** the submission record is created with `status: 'requires_action'` and `suggested_action: 'Upload file to Bing Places dashboard: https://www.bingplaces.com'`

**Given** the export file is generated
**When** the operator views the action queue
**Then** the action item shows: "Bing Places: Upload spreadsheet — [Download File] [Open Bing Places]"
**And** clicking "Download File" downloads the `.xlsx` directly from the API

**Given** `DRY_RUN=true`
**When** the Bing adapter runs
**Then** it generates the file as normal (file export is safe to do in dry run) but marks the submission as `dry-run`

---

### Story 3.5: Facebook Business Adapter (Camoufox Browser)

As an operator,
I want the system to automatically fill and submit the Facebook Business page creation form using stealth browser automation,
So that Facebook business pages are created without manual data entry.

**Acceptance Criteria:**

**Given** the Facebook adapter's `submit()` is called for a business
**When** it executes with `DRY_RUN=false`
**Then** Camoufox launches with the business's `NAPBrowserProfile` fingerprint
**And** ghost-cursor navigates to `facebook.com/pages/create`
**And** all form fields are filled with human-like typing delays: Page Name, Category, Address, Phone, Website

**Given** the form is filled
**When** the adapter reaches the submit step
**Then** it pauses and creates an `action_queue_item` with `status: 'requires_action'`, `reason: 'Facebook page creation requires manual confirmation — browser is ready'`, `suggested_action: 'Review the pre-filled form and click Submit'`
**And** the browser session stays open for operator review (headed mode)

**Given** the Facebook login wall appears (not logged in)
**When** the adapter detects the login redirect
**Then** it creates an `action_queue_item`: `reason: 'Facebook login required', suggested_action: 'Log into Facebook in the open browser window'`
**And** the session waits up to 5 minutes for login to complete before timing out

**Given** the submission results in an HTTP error or page crash
**When** the error is caught
**Then** it is classified as transient (retry) or permanent (surface immediately) per the dual-track error handling pattern
**And** the browser session closes cleanly regardless of outcome

---

### Story 3.6: Yelp Business Adapter (Camoufox Browser)

As an operator,
I want the system to automatically fill the Yelp business submission form using stealth browser automation,
So that Yelp listings are created without manual data entry for each business.

**Acceptance Criteria:**

**Given** the Yelp adapter's `submit()` is called for a business
**When** it executes with `DRY_RUN=false`
**Then** Camoufox launches with the business's `NAPBrowserProfile` fingerprint
**And** navigates to `biz.yelp.com/claim`
**And** fills business name, address, phone with human-like typing and ghost-cursor clicks

**Given** Yelp's form is filled
**When** the adapter submits
**Then** if Yelp returns a success response (listing created/pending verification)
**Then** the submission record is updated to `status: 'submitted'` with the Yelp business URL as `externalId`

**Given** Yelp sends a verification email trigger
**When** the adapter detects the "check your email" confirmation page
**Then** the submission is set to `status: 'requires_action'` with `suggested_action: 'Check email for Yelp verification link and click it'`

**Given** the adapter runs for more than 3 minutes without completing
**When** the timeout fires
**Then** the submission is set to `status: 'failed'`, `errorCode: 'TIMEOUT'`
**And** the browser session closes and resources are released

---

### Story 3.7: Submission Plan Preview & Approval Gate

As an operator,
I want to preview exactly what will be submitted to which directories before anything happens,
So that I can catch mistakes before bad data reaches a live directory.

**Acceptance Criteria:**

**Given** the operator selects one or more businesses from the list and clicks "Submit to Directories"
**When** `POST /api/submissions/plan` is called
**Then** the response shows a plan matrix: each business × each enabled directory, with action type (new submission / already submitted / skipped)
**And** estimated completion time per directory is shown based on current queue depth

**Given** the plan is displayed
**When** the operator reviews it
**Then** they can deselect individual business+directory combinations
**And** they can deselect an entire directory column to exclude it from this batch
**And** the plan re-calculates totals in real-time as selections change

**Given** the operator clicks "Approve & Submit"
**When** `POST /api/submissions/execute` is called
**Then** submission records are created in the `submissions` table with `status: 'queued'` for each approved combination
**And** the operator is redirected to the batch status view showing live queue progress
**And** the queue worker (Story 3.8) picks up `status: 'queued'` records automatically — no direct queue dispatch in this story

**Given** the operator clicks "Cancel" on the plan page
**When** the cancellation fires
**Then** no submission records are created and no jobs are queued
**And** the operator returns to the business list

**Given** a business already has an active submission for a specific directory
**When** the plan is generated
**Then** that combination is shown as "Already Submitted" and excluded from the plan by default

---

### Story 3.8: Queue Infrastructure, Rate Limiting & Retry

As an operator,
I want submissions to be queued with per-directory rate limits and automatic retry on failure,
So that the system respects directory limits and recovers from transient errors without my intervention.

**Acceptance Criteria:**

**Given** BullMQ is configured in `apps/api/src/queue/`
**When** the API server starts
**Then** a separate BullMQ queue exists for each directory slug: `queue:bing-places`, `queue:facebook-business`, `queue:yelp`
**And** Redis AOF persistence is enabled so queued jobs survive server restarts (NFR18)

**Given** a submission job is added to a directory queue
**When** the worker picks it up
**Then** it checks the directory's daily cap from `directories.rate_limits.dailyCap`
**And** if the daily cap is reached, the job is delayed to the next day and the submission status is updated to `status: 'queued'` with a note

**Given** a submission job fails with a transient error (HTTP 429, 500, ETIMEDOUT)
**When** BullMQ handles the failure
**Then** the job retries automatically up to 3 times with exponential backoff: 1 min, 5 min, 30 min (NFR15)
**And** each retry attempt increments `submissions.retry_count`

**Given** all 3 retries are exhausted
**When** the final retry fails
**Then** an `action_queue_items` record is created with `reason` (the last error message) and `suggested_action`
**And** the submission status is set to `'requires_action'`
**And** no silent failure — the action queue item is always created (NFR16)

**Given** a submission job fails with a permanent error (HTTP 400, 401, 403)
**When** the worker catches it
**Then** no retry is attempted — the job fails immediately
**And** an `action_queue_items` record is created instantly with the permanent error reason
**And** the submission status is set to `'requires_action'`

**Given** `GET /api/submissions` is called with `?batchId=X`
**When** the API responds
**Then** all submissions for that batch are returned with current status
**And** queue position and estimated processing time are included in the response

---

## Epic 4: Update Propagation & Lifecycle Management

Operator can push profile changes to all directories, override names per-directory, deactivate businesses, and remove listings — full bidirectional CRUD.

### Story 4.1: Push Profile Updates to Active Directory Listings

As an operator,
I want to push changes to a business profile out to all directories where it's already listed,
So that directory data stays consistent when phone numbers, addresses, or other details change.

**Acceptance Criteria:**

**Given** the operator edits a business profile and saves changes
**When** `PUT /api/businesses/:id` is called and fields have changed
**Then** `update.service.ts` detects which fields changed by comparing old vs new values
**And** for each directory where the business has `status: 'submitted'` or `status: 'verified'`, an update job is queued in `queue:update:{directorySlug}`

**Given** the operator clicks "Push Updates" on the business detail page
**When** `POST /api/submissions/push-updates` is called with `businessId`
**Then** update jobs are dispatched only for directories with active listings
**And** a summary is shown: "Updates queued for 3 directories: Bing Places, Facebook, Yelp"

**Given** an update job runs for a browser-based directory (Facebook, Yelp)
**When** `update.worker.ts` processes it
**Then** Camoufox navigates to the existing listing's edit page using `submissions.external_id`
**And** only the changed fields are updated in the form
**And** the submission record `last_verified` timestamp is refreshed on success

**Given** an update job runs for Bing Places (file export)
**When** the worker processes it
**Then** a new Bing Places spreadsheet is generated with the updated data
**And** an action queue item is created: "Re-upload updated Bing Places spreadsheet — [Download]"

**Given** the update job fails after 3 retries
**When** the action queue item is created
**Then** it shows: "Update failed for [Directory]: [reason] — [Retry] [Edit Override]"

---

### Story 4.2: Per-Directory Business Name Override

As an operator,
I want to override the business name for a specific directory without changing my master profile,
So that I can comply with directory-specific naming requirements (e.g. Facebook page name ≠ business legal name).

**Acceptance Criteria:**

**Given** the operator is on the business detail page
**When** they expand the directory listing row for Facebook Business
**Then** an "Override Name" field is shown alongside the master business name
**And** the current value shown is `submissions.directory_business_name` (or master name if no override exists)

**Given** the operator enters an override name and saves
**When** the save action fires
**Then** `submissions.directory_business_name` is updated for that specific business+directory row
**And** the master `businesses.name` is unchanged
**And** a note is shown: "This directory uses a custom name: [override name]"

**Given** an update is pushed to a directory that has a name override
**When** `update.service.ts` assembles the update payload
**Then** it uses `submissions.directory_business_name` instead of `businesses.name` for that directory
**And** all other fields use the master profile values

**Given** the operator clears the override name
**When** the field is emptied and saved
**Then** `submissions.directory_business_name` is set to `null`
**And** the master `businesses.name` is used for all future submissions to that directory

---

### Story 4.3: Listing Removal for Deactivated Businesses

As an operator,
I want to remove directory listings when I deactivate a business,
So that stale NAP data doesn't pollute the web and confuse Google.

**Acceptance Criteria:**

**Given** the operator deactivates a business
**When** the deactivation confirmation dialog shows
**Then** it includes a checkbox: "Also remove active directory listings"
**And** the checkbox is unchecked by default with a note: "You can do this later from the business detail page"

**Given** the operator checks "Also remove active directory listings" and confirms deactivation
**When** the deactivation completes
**Then** removal jobs are queued for all directories where the business has `status: 'submitted'` or `status: 'verified'`
**And** the business status is set to `'deactivated'`

**Given** a removal job runs for a browser-based directory
**When** `remove.worker.ts` processes it
**Then** Camoufox navigates to the listing management page using `submissions.external_id`
**And** attempts to delete or unpublish the listing
**And** on success: `submissions.status` is set to `'removed'`

**Given** a directory does not support automated removal (no delete/unpublish flow)
**When** the removal worker detects this
**Then** it creates an `action_queue_item` with `reason: 'Manual removal required'`, `suggested_action: 'Visit [direct link to listing] and manually remove it'`
**And** `submissions.status` is set to `'requires_action'`

**Given** the operator wants to remove listings from a business without deactivating it
**When** they click "Remove Listings" on the business detail page
**Then** the same removal flow triggers — deactivation is not required to initiate removal

---

### Story 4.4: Pause & Resume Directory Submissions

As an operator,
I want to pause all submissions to a specific directory without cancelling them,
So that I can temporarily halt a directory that's having issues without losing my queue.

**Acceptance Criteria:**

**Given** the operator navigates to the directory registry
**When** they toggle "Pause" on a directory
**Then** `POST /api/directories/:id/pause` sets `directories.paused = true`
**And** no new jobs are dispatched to that directory's BullMQ queue
**And** existing queued jobs remain in the queue but are not processed

**Given** a directory is paused
**When** the submission plan page is viewed
**Then** that directory column is shown with a "Paused" badge
**And** businesses in the plan for that directory show "Queued (paused)"

**Given** the operator toggles "Resume" on a paused directory
**When** `POST /api/directories/:id/resume` sets `directories.paused = false`
**Then** the BullMQ worker for that directory resumes processing queued jobs
**And** jobs process in their original queue order

**Given** a directory is paused and new businesses are added to a submission plan
**When** the plan is approved and executed
**Then** submission records are created with `status: 'queued'`
**And** jobs are added to the queue but not processed until the directory is resumed
**And** the batch status view clearly shows which submissions are blocked by a pause

---

## Epic 5: Monitoring Dashboard & Action Queue

Operator can monitor the entire citation portfolio at a glance, drill into failures, and resolve action items in under 5 minutes daily.

### Story 5.1: Summary Dashboard

As an operator,
I want a single dashboard view that tells me the health of my entire citation operation at a glance,
So that my daily 5-minute check reveals everything that needs attention without digging.

**Acceptance Criteria:**

**Given** the operator navigates to `/` (root)
**When** `GET /api/dashboard/summary` is called
**Then** the summary bar shows: Total Businesses, Fully Listed (all active directories = submitted/verified), Pending Actions count, Directories Healthy count
**And** the page loads within 3 seconds (NFR1)
**And** all counts use skeleton loaders while fetching — no spinners

**Given** the dashboard loads
**When** the data is displayed
**Then** the color system is applied: green = healthy/submitted, yellow = queued/pending, red = failed/requires_action
**And** the "Pending Actions" count is clickable and navigates to `/action-queue`

**Given** the operator refreshes the dashboard
**When** `GET /api/dashboard/summary` is called again
**Then** data refreshes within 2 seconds (NFR4)
**And** TanStack Query `staleTime` is set to 30 seconds — frequent refreshes use cached data

**Given** the dashboard is viewed on a mobile device (375px)
**When** the layout renders
**Then** the summary bar stacks vertically and all counts remain readable
**And** the page is fully functional on mobile

---

### Story 5.2: Status Matrix — Business × Directory Grid

As an operator,
I want to see submission status for every business across every directory in a grid,
So that I can instantly spot which combinations succeeded, failed, or are pending.

**Acceptance Criteria:**

**Given** the operator navigates to `/submissions`
**When** the status matrix loads
**Then** a table shows rows = businesses, columns = directories (Bing Places, Facebook, Yelp + any others)
**And** each cell shows a color-coded status badge: green (submitted/verified), yellow (queued/submitting), red (failed/requires_action), gray (not submitted)

**Given** the operator clicks a red cell
**When** the drill-down opens
**Then** it shows: error message, retry count, last attempt timestamp, and a direct "Resolve" or "Retry" action

**Given** more than 50 businesses exist
**When** the matrix renders
**Then** pagination or virtual scrolling is applied — the page does not load all rows at once
**And** the page remains responsive with 1,000 businesses (NFR11)

**Given** the operator filters by status (e.g. "Failed only")
**When** the filter is applied
**Then** only rows with at least one cell matching that status are shown
**And** the filter state persists during navigation within the session

---

### Story 5.3: Action Queue

As an operator,
I want a prioritized list of everything that needs my manual attention,
So that I can work through failures and required actions efficiently without hunting through the status matrix.

**Acceptance Criteria:**

**Given** the operator navigates to `/action-queue`
**When** `GET /api/action-queue` is called
**Then** all unresolved `action_queue_items` are shown sorted by: permanent failures first, then oldest first
**And** the page loads within 1 second (NFR5)

**Given** an action queue item is displayed
**When** the operator views it
**Then** each item shows: Business Name, Directory, Reason (why it failed), Suggested Action (what to do), Created timestamp
**And** for browser-based failures with a direct link, a "Go to Listing" button is shown
**And** for Bing Places file exports, a "Download File" button is shown

**Given** the operator resolves an action item (manually completed the action)
**When** they click "Mark Resolved"
**Then** `POST /api/action-queue/:id/resolve` sets `action_queue_items.status = 'resolved'` and `resolved_at = now()`
**And** the item disappears from the queue immediately
**And** the `submissions` record status is updated to `'submitted'` or `'requires_action'` based on resolution type

**Given** the operator clicks "Retry" on a failed item
**When** the retry action fires
**Then** a new submission job is queued for that business+directory combination
**And** `submissions.retry_count` is reset to 0 for the new attempt
**And** the action queue item is marked `'resolved'` and a new one will be created only if the retry also fails

**Given** all action queue items are resolved
**When** the queue page loads
**Then** an empty state shows: "All clear — no pending actions" with a green checkmark

---

### Story 5.4: Per-Business Citation Profile Detail

As an operator,
I want to see a complete citation profile for any single business,
So that I can audit its directory coverage before attempting GBP verification.

**Acceptance Criteria:**

**Given** the operator navigates to `/businesses/:id`
**When** the detail page loads
**Then** the business profile fields are shown at the top (name, address, phone, category, website, status)
**And** below that, a citation profile table shows one row per directory: Directory Name, Status badge, External ID/URL, Last Verified timestamp, Override Name (if set)

**Given** a directory listing has `status: 'submitted'` or `status: 'verified'`
**When** the external ID is a URL
**Then** it is shown as a clickable link opening the live listing in a new tab

**Given** the operator views a business with inconsistent NAP data across directories
**When** the citation profile is displayed
**Then** any field value that differs from the master profile is highlighted in yellow with a tooltip: "Differs from master profile"

**Given** the business has no directory submissions yet
**When** the citation profile section renders
**Then** each directory row shows "Not Submitted" (gray) with a "Submit" action button

**Given** the last verified timestamp is more than 7 days old
**When** the timestamp is displayed
**Then** it shows in yellow with a tooltip: "Last verified over 7 days ago — consider re-verifying"

---

### Story 5.5: Batch-Level Status Tracking

As an operator,
I want to see the submission progress for each import batch as a group,
So that I can track "the 15 sites I imported Monday" as a cohesive unit rather than hunting for them individually.

**Acceptance Criteria:**

**Given** the operator navigates to `/submissions?view=batches`
**When** the batch list loads
**Then** each batch is shown as a card with: import date, CSV filename, total businesses, progress bar (X/Y submitted), and counts by status (submitted, queued, failed, requires_action)

**Given** the operator clicks on a batch card
**When** the batch detail view opens
**Then** all businesses in that batch are shown with their per-directory status
**And** a "Retry All Failed" button queues new jobs for all failed submissions in the batch

**Given** a batch is fully submitted (all combinations green)
**When** the batch card is displayed
**Then** it shows a green "Complete" badge
**And** the completion date is shown

**Given** `GET /api/submissions?batchId=X` is called
**When** the API responds
**Then** all submissions for that batch are returned with current status and retry counts
**And** response time is under 2 seconds for batches of up to 500 businesses

---

## Epic 6: Directory Registry & Health Monitoring

Operator can manage directories, see health status, and the system automatically detects degradation and pauses submissions.

### Story 6.1: Directory Registry List & Health Overview

As an operator,
I want to see all my integrated directories and their current health in one place,
So that I know immediately if a directory is down before wasting submissions.

**Acceptance Criteria:**

**Given** the operator navigates to `/directories`
**When** the page loads
**Then** all directories from the `directories` table are shown with: Name, Type (browser/file_export/api), Health Status badge (healthy/degraded/down/paused), Last Health Check timestamp, Daily Cap, Paused toggle

**Given** a directory has `health_status: 'degraded'` or `'down'`
**When** the registry renders
**Then** that row is shown with a red/yellow badge at the top of the list (sorted by health urgency)
**And** the failure reason is shown: "Last 5 requests failed: HTTP 503"

**Given** the operator toggles the Pause switch on a directory row
**When** the toggle fires
**Then** `directories.paused` is updated immediately via `POST /api/directories/:id/pause` or `resume`
**And** the toggle reflects the new state with visual confirmation

**Given** the page loads
**When** health data is fetched
**Then** TanStack Query refetches directory health on every page visit (no stale cache for health data)

---

### Story 6.2: Automated Directory Health Monitoring & Auto-Pause

As an operator,
I want the system to automatically detect when a directory is failing and pause it,
So that I don't burn through rate limit attempts on a broken directory.

**Acceptance Criteria:**

**Given** a scheduled BullMQ health check job runs for a directory
**When** `health-check.worker.ts` calls `adapter.checkHealth()`
**Then** the result updates `directories.health_status` and `directories.last_health_check`
**And** health checks run every 30 minutes per directory via a repeatable BullMQ job

**Given** 5 consecutive submission jobs for a directory have all failed
**When** `health.service.ts` detects the threshold (NFR19)
**Then** `directories.paused` is automatically set to `true` and `directories.health_status` is set to `'degraded'`
**And** an `action_queue_item` is created: "Directory auto-paused: [name] — 5 consecutive failures detected. Investigate and resume when ready."
**And** no further jobs are dispatched to that directory until manually resumed

**Given** a directory is auto-paused
**When** the operator resumes it
**Then** `directories.paused = false` and `directories.health_status = 'healthy'`
**And** the failure counter resets to 0
**And** queued jobs resume processing

**Given** the health check adapter call returns a healthy response after auto-pause
**When** the health check runs
**Then** `health_status` is updated to `'healthy'` but `paused` remains `true` — operator must manually resume
**And** the action queue item note updates: "Health check now passing — safe to resume"

---

### Story 6.3: Add New Directory to Registry

As an operator,
I want to add a new directory to the registry with its configuration,
So that I can expand coverage to new directories without any code changes.

**Acceptance Criteria:**

**Given** the operator clicks "Add Directory" in the registry
**When** the form opens
**Then** fields are shown for: Directory Name, Slug (auto-generated from name, editable), Type (browser / file_export / api), Daily Cap, Timeout (seconds), Notes/URL

**Given** the operator submits the form
**When** `POST /api/directories` is called
**Then** a new row is inserted in the `directories` table with `api_config` as a JSONB object containing the submitted config
**And** no schema migration is required (NFR13)
**And** `health_status` defaults to `'healthy'`, `paused` defaults to `false`

**Given** a new directory is added with `type: 'browser'`
**When** the developer creates the corresponding adapter file
**Then** a new file at `apps/api/src/integrations/{slug}.adapter.ts` implementing `DirectoryAdapter` is all that's needed
**And** registering it in `integrations/index.ts` completes the integration
**And** no changes to existing adapter files are required (NFR14)

**Given** the new directory slug is already taken
**When** the form submits
**Then** a validation error shows: "Slug already exists — choose a unique identifier"

---

## Epic 7: Reporting & Data Export

Operator can export everything to CSV and verify NAP consistency for any business.

### Story 7.1: Full Data Export to CSV

As an operator,
I want to export all my business data and directory submission statuses to a CSV file,
So that I have offline records and can share portfolio status with others.

**Acceptance Criteria:**

**Given** the operator navigates to `/export`
**When** the page loads
**Then** export options are shown: All Businesses, Filter by Status (active/deactivated), Filter by Directory, Date range for import date

**Given** the operator clicks "Export CSV"
**When** `GET /api/export/csv` is called with selected filters
**Then** a CSV file downloads with columns: Business Name, Address, City, State, Zip, Phone, Category, Website, Status, [per directory: Bing Status, Bing Last Verified, Facebook Status, Facebook Last Verified, Yelp Status, Yelp Last Verified]
**And** the export completes within 10 seconds for up to 1,000 businesses

**Given** the operator exports with no filters
**When** the CSV is generated
**Then** every business in the database is included regardless of status
**And** directory columns show "Not Submitted" for combinations with no submission record

**Given** the export is triggered
**When** `export.service.ts` generates the file
**Then** no sensitive data (API keys, credentials) appears in any CSV column (NFR9, NFR10)

---

### Story 7.2: NAP Consistency Check

As an operator,
I want to verify that a business's NAP data is consistent across all its active directory listings,
So that I can confirm the citation footprint is clean before attempting GBP verification.

**Acceptance Criteria:**

**Given** the operator is on a business detail page
**When** they click "Run Consistency Check"
**Then** `GET /api/businesses/:id/consistency` is called
**And** the system compares the master profile fields (name, address, phone) against the `submissions` records for that business

**Given** the consistency check runs
**When** results are returned
**Then** a table shows each directory with: Field, Master Value, Directory Value, Match status (green checkmark / red X)
**And** if all fields match across all directories: "NAP is consistent — ready for GBP verification" (green banner)
**And** if any mismatch exists: "NAP inconsistency detected — [N] fields differ" (red banner) with the specific mismatches listed

**Given** a directory listing has `status` of `'not_submitted'` or `'removed'`
**When** the consistency check runs
**Then** that directory is excluded from the check with a note: "Not applicable — no active listing"

**Given** the consistency check completes
**When** the operator views the results
**Then** they can click "Push Updates" directly from the consistency check results to queue correction updates to mismatched directories
