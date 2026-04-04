# Story 5.1 — Summary Dashboard

## Status: done

## What was built

A dashboard overview page at `/dashboard` that gives operators an at-a-glance summary of the citation engine state.

## Backend

`GET /api/submissions/summary` in `apps/api/src/routes/submissions.routes.ts`

Returns:
- `totalBusinesses` / `activeBusinesses` counts
- `totalDirectories` / `healthyDirectories` counts
- `submissionsByStatus`: count per submission status enum value
- `recentActivity`: last 10 updated submissions with joined business/directory names

## Frontend

- Hook: `apps/web/src/features/monitoring/hooks/useDashboardSummary.ts` — staleTime 30s
- Page: `apps/web/src/features/monitoring/pages/DashboardPage.tsx`

### UI sections

1. **Stats row** — 4 cards (Total Businesses, Active Businesses, Total Directories, Healthy Directories)
2. **Status Breakdown** — stacked bar (Tailwind width percentages) + legend with status counts
3. **Recent Activity** — table of last 10 submissions with Business, Directory, Status badge, Updated timestamp

## Route

`/dashboard` (to be wired in App.tsx consolidation step)
