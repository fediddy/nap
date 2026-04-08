> Part of [[Epics]]

# Next Up

## Recommended Build Order

The UI and frontend routes already reference pages that don't exist yet (SubmissionPlanPage, DirectoriesListPage, DashboardPage, etc.). Two paths:

### Path A: Fill the UI Shell First (Fast Wins)
Build the stub pages that App.tsx already imports so the app doesn't error:
1. Epic 5 dashboard pages (monitoring) — stub with real data from existing businesses
2. Epic 6 directory registry UI — display the 26 seeded directories
3. Epic 7 CSV export — straightforward, high value

### Path B: Build the Submission Engine (Core Value)
Go straight to Epic 3 — the actual citation submission functionality:
1. Story 3.3: Directory adapter pattern (base class + interface)
2. Story 3.4: Bing Places adapter (file export — simplest, no auth)
3. Story 3.8: Queue infrastructure (BullMQ setup)
4. Story 3.7: Submission plan preview + approval gate UI

## Decision Criteria
- If the goal is showing progress quickly: Path A
- If the goal is delivering citation value: Path B
- Recommended: do Path A for monitoring/directories UI (1-2 days) then Path B

## Immediate TODO
The app imports these pages that don't exist yet — will cause build errors:
- `SubmissionPlanPage` — `apps/web/src/features/businesses/pages/SubmissionPlanPage.tsx`
- `BusinessCitationPage` — `apps/web/src/features/monitoring/pages/BusinessCitationPage.tsx`
- `DirectoriesListPage` — `apps/web/src/features/directories/pages/DirectoriesListPage.tsx`
- `AddDirectoryPage` — `apps/web/src/features/directories/pages/AddDirectoryPage.tsx`
- `DashboardPage` — `apps/web/src/features/monitoring/pages/DashboardPage.tsx`
- `StatusMatrixPage`, `ActionQueuePage` — monitoring pages
- `ExportPage` — `apps/web/src/features/reporting/pages/ExportPage.tsx`
