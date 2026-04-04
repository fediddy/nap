# Story 5.4 — Per-Business Citation Profile Detail

## Status: done

## What was built

A per-business citation detail page at `/businesses/:id/citations` showing all directory submissions for a single business.

## Backend

`GET /api/businesses/:id/submissions` in `apps/api/src/routes/submissions.routes.ts`

Joins submissions + directories filtered by `businessId`, ordered by directory name.

Response per row:
- `submissionId`, `directoryId`, `directoryName`, `directorySlug`
- `status`, `externalId`, `errorCode`, `message`
- `lastAttempt`, `submittedAt`, `verifiedAt`

## Frontend

- Hook: `apps/web/src/features/monitoring/hooks/useBusinessSubmissions.ts` — enabled only when `id` is truthy
- Page: `apps/web/src/features/monitoring/pages/BusinessCitationPage.tsx`

### UI

- "Back to business" link to `/businesses/:id`
- Heading: "Citation Profile"
- Table: Directory, Status badge, External ID, Last Attempt, Submitted At, Actions
- Actions column shows Retry button only for `failed` or `requires_action` submissions
- Empty state when no submissions exist

## Route

`/businesses/:id/citations`
