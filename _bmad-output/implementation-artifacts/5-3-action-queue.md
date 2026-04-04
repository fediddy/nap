# Story 5.3 — Action Queue

## Status: done

## What was built

An action queue page at `/actions` listing all submissions with status `requires_action` or `failed` that need operator attention.

## Backend

`GET /api/submissions/actions` in `apps/api/src/routes/submissions.routes.ts`

Joins submissions + businesses + directories, filters by `status IN ('requires_action', 'failed')`, ordered by `lastAttempt` descending.

`PATCH /api/submissions/:id` — updates status (and optionally message), sets `updatedAt = now()`, sets `lastAttempt = now()` if transitioning to `submitting`.

## Frontend

- Hook: `apps/web/src/features/monitoring/hooks/useActionQueue.ts` — staleTime 0 (always fresh)
- Hook: `apps/web/src/features/monitoring/hooks/useUpdateSubmission.ts` — mutation, invalidates `action-queue`, `status-matrix`, `dashboard-summary`
- Page: `apps/web/src/features/monitoring/pages/ActionQueuePage.tsx`

### UI

- Heading "Action Queue" with count badge
- Table: Business, Directory, Status, Error Code, Message, Last Attempt, Actions
- **Retry** button: sets status → `queued`
- **Dismiss** button: sets status → `submitted` with message "Manually dismissed"
- Empty state: "No pending actions — everything looks good!"

## Route

`/actions`
