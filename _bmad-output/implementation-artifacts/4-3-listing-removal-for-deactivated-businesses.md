# Story 4.3 — Listing Removal for Deactivated Businesses

## Status: Done

## Summary

Provides an endpoint to remove all active directory listings for a business, typically triggered after the business is deactivated.

## Implementation

**Route:** `apps/api/src/routes/propagation.routes.ts`

**Endpoint:** `POST /api/businesses/:id/remove-listings`

**Optional body:** `{ force: true }` — allows removal even if the business is still active

### Behavior
- Loads the business record (404 if not found)
- Rejects with `400 BUSINESS_ACTIVE` if business status is not `deactivated` and `force` is not set
- Queries all submissions with status `submitted` or `verified` for the business
- For each submission:
  - If no `externalId` → counted as skipped
  - If no adapter found → counted as skipped
  - Otherwise → calls `adapter.remove(externalId)` and updates submission status to `removed` or `failed`
- All DB updates are wrapped in a transaction

### Response Shape
```json
{
  "data": {
    "removed": 2,
    "failed": 0,
    "skipped": 1,
    "results": [
      { "directorySlug": "bing-places", "status": "removed" },
      { "directorySlug": "facebook", "status": "removed" },
      { "directorySlug": "yelp", "status": "skipped" }
    ]
  }
}
```

## Frontend Hook

**File:** `apps/web/src/features/businesses/hooks/useRemoveListings.ts`

- Mutation calling `POST /api/businesses/:id/remove-listings`
- Accepts optional `{ force?: boolean }` argument
- Invalidates `['business-submissions', id]` and `['status-matrix']` on success
