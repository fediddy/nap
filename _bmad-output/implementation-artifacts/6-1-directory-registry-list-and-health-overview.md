# Story 6.1: Directory Registry List and Health Overview

Status: done

## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created DirectoriesListPage at apps/web/src/features/directories/pages/DirectoriesListPage.tsx
- Displays a responsive table of all registered directories with Name/slug, Type badge (browser=purple, file_export=blue, api=green), Health badge (healthy=green, degraded=yellow, down=red), Daily Cap, Last Check, and Status toggle
- Loading skeleton renders 4 placeholder rows while fetching
- Empty state message: "No directories registered yet — add one to get started." with a CTA link
- Active/Paused toggle button calls usePauseDirectory() with per-row loading spinner while mutating
- Wired into App.tsx at route /directories
### File List
- apps/web/src/features/directories/pages/DirectoriesListPage.tsx (created)
- apps/web/src/App.tsx (modified)
