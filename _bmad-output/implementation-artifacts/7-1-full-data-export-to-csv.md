# Story 7.1 — Full Data Export to CSV

## Status: Done

## What was built

### Backend: `apps/api/src/routes/export.routes.ts`

`GET /api/export/businesses`

- Query param `status` (optional): filters by `active` or `deactivated`
- Query param `includeSubmissions` (optional, `'true'`): when set, joins all submissions and all directories, adding `{slug}_status` and `{slug}_externalId` columns per directory
- Generates CSV via PapaParse `unparse()`
- Sets `Content-Type: text/csv` and `Content-Disposition` headers with a dated filename

### Frontend hook: `apps/web/src/features/reporting/hooks/useExportBusinesses.ts`

- Exports `useExportBusinesses()` returning `{ exportCsv }`
- `exportCsv({ includeSubmissions?, status? })` fetches the CSV endpoint, creates a Blob URL, and triggers a browser download

### Frontend page: `apps/web/src/features/reporting/pages/ExportPage.tsx`

Route `/export` — provides:
- Checkbox to toggle submission columns
- Radio group for status filter (All / Active / Deactivated)
- Download button with loading state and error display

## Key decisions

- PapaParse is used server-side via `import Papa from 'papaparse'`
- All imports in the route file use `.js` extensions per project convention
- Directory columns are dynamically generated from the full `directories` table so new directories appear automatically without schema changes
