# Story 3.7: Submission Plan Preview and Approval Gate
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created `apps/api/src/routes/plan.routes.ts` exporting `planRoutes` as the default async Fastify plugin
- `GET /api/businesses/:id/plan` returns a dry-run plan for all directories: loads all directories, loads existing submissions for the business, applies action logic (submit/update/skip) with reason strings per spec
- `POST /api/businesses/:id/approve-plan` accepts optional `{ directoryIds?: string[] }` body; inserts new submissions with status 'queued' for directories with no existing record, updates failed/requires_action/removed submissions to 'queued' clearing errorCode and message, skips paused/down/in-progress directories
- Created `apps/web/src/features/businesses/hooks/useSubmissionPlan.ts` — `useQuery` with `staleTime: 0` fetching `/api/businesses/${id}/plan`
- Created `apps/web/src/features/businesses/hooks/useApprovePlan.ts` — `useMutation` for POST `/api/businesses/:id/approve-plan`, invalidates `['submission-plan', id]` and `['business-submissions', id]` on success
- Created `apps/web/src/features/businesses/pages/SubmissionPlanPage.tsx` — table of planItems with ActionBadge (green=submit, blue=update, gray=skip) and StatusBadge for existing status, "Approve Plan" button that calls useApprovePlan and navigates to `/businesses/:id` on success, loading skeleton and error state
- Note: `plan.routes.ts` and `SubmissionPlanPage` route need to be registered in `server.ts` and `App.tsx` respectively (outside the scope of this story per constraints)
### File List
- `apps/api/src/routes/plan.routes.ts` (created)
- `apps/web/src/features/businesses/hooks/useSubmissionPlan.ts` (created)
- `apps/web/src/features/businesses/hooks/useApprovePlan.ts` (created)
- `apps/web/src/features/businesses/pages/SubmissionPlanPage.tsx` (created)
