> Part of [[BRAIN-INDEX]]

# Execution Plan

Current build priority for the NAP Citation Engine.

## ~~Phase: Get the App Fully Rendering~~ ✅ COMPLETE (Session 1)

All pages and backend routes were already built. Full monorepo build clean.
App is live and rendering at `nap.fediddy.com`.

### Missing Pages (must create stubs)
- [x] `apps/web/src/features/monitoring/pages/DashboardPage.tsx`
- [x] `apps/web/src/features/monitoring/pages/StatusMatrixPage.tsx`
- [x] `apps/web/src/features/monitoring/pages/ActionQueuePage.tsx`
- [x] `apps/web/src/features/monitoring/pages/BusinessCitationPage.tsx`
- [x] `apps/web/src/features/directories/pages/DirectoriesListPage.tsx`
- [x] `apps/web/src/features/directories/pages/AddDirectoryPage.tsx`
- [x] `apps/web/src/features/businesses/pages/SubmissionPlanPage.tsx`
- [x] `apps/web/src/features/reporting/pages/ExportPage.tsx`

### Backend Routes Needed
- [x] `GET /api/directories` — list all directories (for DirectoriesListPage)
- [x] `GET /api/submissions/summary` — dashboard summary stats
- [x] `GET /api/submissions/matrix` — status matrix data

## Phase: Core Submission Engine (Epic 3)

Once UI shell is complete:
1. Story 3.3: Directory adapter base pattern
2. Story 3.8: BullMQ queue setup
3. Story 3.4: Bing Places adapter (simplest — no auth, file export)
4. Story 3.7: Submission plan preview + approval gate

## Phase: Complete Monitoring (Epic 5)
Full implementation of dashboard, status matrix, action queue with real data.

## Phase: Browser Adapters (Epic 3 continued)
Story 3.5: Facebook adapter
Story 3.6: Yelp adapter
Requires: Camoufox setup, proxy infrastructure

---
*Last updated: 2026-04-08*
