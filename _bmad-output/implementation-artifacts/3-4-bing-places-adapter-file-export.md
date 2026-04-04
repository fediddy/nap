# Story 3.4: Bing Places Adapter (File Export)
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created `BingPlacesAdapter` implementing `DirectoryAdapter` with `slug: 'bing-places'`, `type: 'file_export'`
- `submit()` and `update()` both append a CSV row to `bing-exports/{YYYY-MM-DD}-bing-places.csv`, writing the header on first creation
- CSV columns: `storeName`, `addressLine1`, `city`, `stateOrProvince`, `postalCode`, `countryOrRegion` (always "US"), `phone`, `website`, `category`
- Fields with commas, quotes, or newlines are properly escaped per RFC 4180
- `remove()` returns `not_found` with a message directing the operator to the Bing dashboard
- `checkHealth()` ensures `bing-exports/` is writable by attempting to create/append a `.health-check` sentinel file
- Uses `fs/promises` throughout; directory is created with `mkdir({ recursive: true })` if absent
- Registered in `apps/api/src/integrations/index.ts` at module load
### File List
- `apps/api/src/integrations/bing.adapter.ts` (created)
- `apps/api/src/integrations/index.ts` (updated)
