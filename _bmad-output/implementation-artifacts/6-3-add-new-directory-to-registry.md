# Story 6.3: Add New Directory to Registry

Status: done

## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created AddDirectoryPage at apps/web/src/features/directories/pages/AddDirectoryPage.tsx
- Form fields: Name, Slug (auto-generated from name, user-editable), Type (browser/file_export/api select), Daily Cap (default 10), Timeout in seconds (default 30), Notes (optional textarea)
- Slug auto-generation: lowercase, spaces to hyphens, strips non-alphanumeric except hyphens; user can override manually
- Managed with react-hook-form; inline field-level validation errors shown below each input
- On submit POSTs to /api/directories; on success navigates to /directories and shows toast; on error shows error toast
- Back link to /directories in the page header
- Wired into App.tsx at route /directories/new
### File List
- apps/web/src/features/directories/pages/AddDirectoryPage.tsx (created)
- apps/web/src/App.tsx (modified)
