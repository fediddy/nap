# Story 4.1 — Push Profile Updates to Active Directory Listings

## Status: Done

## Summary

Implements `POST /api/businesses/:id/push-updates` which pushes the current business profile to all directories that have an active (submitted or verified) submission.

## Implementation

**Route:** `apps/api/src/routes/propagation.routes.ts`

**Endpoint:** `POST /api/businesses/:id/push-updates`

### Behavior
- Loads the business record by ID (404 if not found)
- Queries all submissions with status `submitted` or `verified` joined with their directory
- For each submission:
  - If the directory is paused → skip with `{ status: 'skipped', reason: 'directory_paused' }`
  - If no `externalId` → skip with `{ status: 'skipped', reason: 'no_external_id' }`
  - If no adapter found for slug → mark failed, update DB
  - Otherwise → calls `adapter.update(business, externalId)` and persists result
- All DB updates are wrapped in a transaction
- Updates `lastAttempt = now()` on each touched submission

### Response Shape
```json
{
  "data": {
    "updated": 2,
    "failed": 0,
    "results": [
      { "directorySlug": "bing-places", "status": "submitted" },
      { "directorySlug": "yelp", "status": "skipped", "reason": "directory_paused" }
    ]
  }
}
```

## Frontend Hook

**File:** `apps/web/src/features/businesses/hooks/usePushUpdates.ts`

- Mutation calling `POST /api/businesses/:id/push-updates`
- Invalidates `['business-submissions', id]` on success
