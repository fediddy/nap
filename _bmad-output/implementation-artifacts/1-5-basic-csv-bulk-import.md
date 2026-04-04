# Story 1.5: Basic CSV Bulk Import

Status: done

## Story

As an operator,
I want to upload a CSV file to bulk-import multiple business profiles at once,
So that I can add 10–100 businesses in one action instead of creating them one by one.

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- batches table added to schema.ts (batch_status enum, 6 columns)
- Migration 0001_blue_lady_deathstrike.sql generated for batches table
- POST /api/businesses/import handles: header validation, row-level Zod validation, 422 VALIDATION_PREVIEW for partial invalid, importValidOnly flag for partial import
- Frontend: two-stage ImportPage (drag-drop upload + validation preview table)
- /businesses/import route placed before /:id in App.tsx to avoid route shadowing
- "+ Import CSV" button added to BusinessesListPage header
- Both apps type-check clean

### File List
- apps/api/src/db/schema.ts (updated — batches table + enum)
- apps/api/src/routes/import.routes.ts (created)
- apps/api/src/server.ts (updated — importRoutes registered)
- apps/api/drizzle/migrations/0001_blue_lady_deathstrike.sql (generated)
- apps/web/src/App.tsx (updated — /businesses/import route)
- apps/web/src/features/businesses/pages/BusinessesListPage.tsx (updated — Import CSV button)
- apps/web/src/features/businesses/hooks/useImportBusinesses.ts (created)
- apps/web/src/features/businesses/pages/ImportPage.tsx (created)
