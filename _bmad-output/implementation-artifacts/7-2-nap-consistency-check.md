# Story 7.2 — NAP Consistency Check

## Status: Done

## What was built

### Backend: `apps/api/src/routes/export.routes.ts`

`GET /api/export/nap-consistency`

Scans all businesses (active + deactivated) and runs these checks:

| Field | Check |
|-------|-------|
| phone | Must match US 10-digit format (with optional country code, separators) |
| website | If present: must start with `http://` or `https://`; must not contain spaces |
| name | Must not contain `<`, `>`, `&`, or `"` |
| address (zip) | Zip must match 5-digit or ZIP+4 format |
| address (city) | Must not be empty or contain digits |
| address (state) | Must not be empty or contain digits |

Returns JSON:
```json
{
  "data": [
    {
      "businessId": "...",
      "businessName": "...",
      "issues": [{ "field": "phone", "issue": "..." }]
    }
  ],
  "meta": { "totalChecked": 42, "issuesFound": 3 }
}
```

Only businesses with at least one issue appear in `data`.

### Frontend hook: `apps/web/src/features/reporting/hooks/useNapConsistency.ts`

- `useQuery(['nap-consistency'])` with `staleTime: 60_000` and `enabled: false`
- `enabled: false` means the check only runs when `refetch()` is explicitly called from the UI

### Frontend page: `apps/web/src/features/reporting/pages/ExportPage.tsx`

The NAP Consistency Check section provides:
- "Run Check" button that calls `refetch()`
- Loading skeleton while check runs
- Count badge showing `X issues found across Y businesses`
- Results table: Business Name + list of `field: issue` pairs
- Green success message when all businesses pass
