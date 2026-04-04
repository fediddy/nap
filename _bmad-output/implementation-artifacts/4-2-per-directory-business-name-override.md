# Story 4.2 — Per-Directory Business Name Override

## Status: Done

## Summary

Allows operators to store a custom business name to be used for a specific directory, without altering the canonical business record.

## Implementation

**Route:** `apps/api/src/routes/propagation.routes.ts`

### Storage Strategy
Overrides are stored in the `submissions.message` column as a JSON string with the shape `{"nameOverride": "Custom Name Here"}`. This avoids schema changes while keeping the data co-located with the submission.

---

### Endpoint: `POST /api/businesses/:id/name-override`

**Body:** `{ directoryId: string; overrideName: string }`

**Behavior:**
- Validates that both `directoryId` and `overrideName` are present
- Verifies the business and directory exist (404 if not)
- If a submission row exists for this business+directory, updates its `message` field
- If no submission row exists, inserts a new `queued` submission with the override message
- Returns the stored override details

**Response:**
```json
{
  "data": {
    "businessId": "uuid",
    "directoryId": "uuid",
    "directoryName": "Yelp",
    "overrideName": "Custom Name"
  }
}
```

---

### Endpoint: `GET /api/businesses/:id/name-overrides`

**Behavior:**
- Fetches all submissions for the business joined with directory info
- Filters for rows where `message` is valid JSON containing a `nameOverride` key
- Returns decoded overrides

**Response:**
```json
{
  "data": [
    {
      "directoryId": "uuid",
      "directoryName": "Yelp",
      "overrideName": "Custom Name"
    }
  ]
}
```

## Notes
- No migration required — piggybacks on existing `submissions.message` text column
- The `nameOverride` value should be passed by the caller into `adapter.update()` when that workflow incorporates per-directory name resolution
