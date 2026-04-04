# Story 6.2: Automated Directory Health Monitoring and Auto-Pause

Status: done

## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Backend health.service.ts implements auto-pause logic (already complete prior to this sprint)
- DirectoriesListPage fetches with staleTime: 0 (via useDirectories hook) so health status is always fresh on every page visit
- Health badges (healthy/degraded/down) surface current status visually on the list page
- Pause/Resume toggle in the UI allows manual override in addition to auto-pause
### File List
- apps/api/src/services/health.service.ts (pre-existing, not modified)
- apps/web/src/features/directories/hooks/useDirectories.ts (pre-existing, not modified)
- apps/web/src/features/directories/pages/DirectoriesListPage.tsx (created)
