# Story 3.8: Queue Infrastructure, Rate Limiting, and Retry
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created `apps/api/src/queues/submission.queue.ts` with BullMQ Queue and Worker for processing directory submissions
- IORedis connection uses `REDIS_URL` env var (defaults to `redis://localhost:6379`) with `maxRetriesPerRequest: null` for BullMQ compatibility
- Worker processes jobs one at a time (`concurrency: 1`) with a rate limiter of 1 job per 5 seconds
- Job processor: marks submission as 'submitting', loads business from DB, resolves adapter via `getAdapter(slug)`, calls `adapter.update()` or `adapter.submit()` based on action, updates submission record with result status/externalId/errorCode/message
- On job failure: counts recent failed jobs for the same directory slug (from last 20 failed jobs), calls `checkDirectoryFailureThreshold()` to auto-pause at 5+ consecutive failures
- `enqueueQueuedSubmissions()` selects all submissions with status='queued' joined with non-paused directories, enqueues each with 3 attempts, exponential backoff (30s/60s/120s), removeOnComplete=100, removeOnFail=200
- Added `POST /api/queue/process` endpoint to `plan.routes.ts` — manually triggers `enqueueQueuedSubmissions()`
- Added `GET /api/queue/status` endpoint to `plan.routes.ts` — returns waiting/active/completed/failed counts from BullMQ
- `submissionWorker` is exported for server.ts to start on boot
### File List
- `apps/api/src/queues/submission.queue.ts` (created)
- `apps/api/src/routes/plan.routes.ts` (updated — queue endpoints added)
