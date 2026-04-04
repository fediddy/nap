# Story 4.4 — Pause and Resume Directory Submissions

## Status: Done

## Summary

Allows operators to temporarily pause and later resume queued submissions for a specific business without altering the directory-level pause state.

## Implementation

**Route:** `apps/api/src/routes/propagation.routes.ts`

### Design Decision
Rather than adding a new `paused` status to the `submissionStatusEnum` (which would require a DB migration), paused submissions are represented using the existing `requires_action` status with a sentinel `message` value of `'Paused by operator'`. The resume endpoint only unpauses submissions matching this exact sentinel value, so it does not accidentally resume submissions that are in `requires_action` for other reasons.

---

### Endpoint: `POST /api/businesses/:id/pause-submissions`

**Behavior:**
- Verifies the business exists (404 if not)
- Updates all `queued` submissions for this business to `requires_action` with `message = 'Paused by operator'`
- Returns count of affected submissions

**Response:**
```json
{
  "data": {
    "paused": 3,
    "message": "3 queued submission(s) paused"
  }
}
```

---

### Endpoint: `POST /api/businesses/:id/resume-submissions`

**Behavior:**
- Verifies the business exists (404 if not)
- Finds all submissions in `requires_action` with `message = 'Paused by operator'`
- Updates them back to `queued` and clears the message
- Returns count of resumed submissions

**Response:**
```json
{
  "data": {
    "resumed": 3,
    "message": "3 submission(s) resumed"
  }
}
```

---

## Frontend Hook

**File:** `apps/web/src/features/businesses/hooks/usePauseSubmissions.ts`

Exports two hooks:
- `usePauseSubmissions(id)` — mutation for `POST /api/businesses/:id/pause-submissions`
- `useResumeSubmissions(id)` — mutation for `POST /api/businesses/:id/resume-submissions`

Both invalidate `['business-submissions', id]` on success.

## Notes
- Directory-level pause/resume is already handled by `POST /api/directories/:id/pause` and `/resume` in `directories.routes.ts` — this story adds the complementary business-level control
