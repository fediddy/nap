# Story 5.2 — Status Matrix (Business × Directory Grid)

## Status: done

## What was built

A grid page at `/matrix` showing every business × directory combination and its current submission status.

## Backend

`GET /api/submissions/matrix` in `apps/api/src/routes/submissions.routes.ts`

Implementation: fetches all businesses, directories, and submissions separately, then builds a flat list of all B×D combinations in JavaScript using a Map lookup keyed by `${businessId}:${directoryId}`.

Response shape per cell:
- `businessId`, `businessName`, `businessStatus`
- `directoryId`, `directoryName`
- `status` (SubmissionStatus or null)
- `submissionId`, `externalId`, `lastAttempt`

## Frontend

- Hook: `apps/web/src/features/monitoring/hooks/useStatusMatrix.ts` — staleTime 30s
- Page: `apps/web/src/features/monitoring/pages/StatusMatrixPage.tsx`

### UI

- Table with businesses as rows and directories as columns
- Active businesses shown first (sorted by name), deactivated at bottom with reduced opacity
- Status cells: color-coded badge or "—" for no submission
- Refresh button that calls `queryClient.invalidateQueries(['status-matrix'])`
- Horizontal scroll container when grid > 20 businesses or > 5 directories
- Loading state: skeleton rows

## Route

`/matrix`
