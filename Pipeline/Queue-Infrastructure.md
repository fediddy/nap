> Part of [[Pipeline]]

# Queue Infrastructure

## BullMQ Setup (Story 3.8)
- **Queue name**: `submissions`
- **Redis**: Coolify managed Redis (connection via REDIS_URL env var)
- **Workers**: `apps/api/src/workers/submission.worker.ts`

## Job Structure
```typescript
interface SubmissionJob {
  submissionId: string;  // FK to submissions table
  businessId: string;
  directorySlug: string;
  attemptNumber: number;
}
```

## Rate Limiting Strategy
Per-directory rate limits stored in `directories.rateLimits` JSONB:
- `requestsPerMinute`: global rate cap
- `delayMs`: minimum between submissions

BullMQ `limiter` option per queue:
```typescript
const queue = new Queue('submissions', {
  limiter: {
    max: directory.rateLimits.requestsPerMinute,
    duration: 60_000,
  }
});
```

## Daily Cap Enforcement
- Per-directory daily submission cap: 5-10 new listings
- Check count of submissions for directoryId where createdAt > today midnight
- If at cap → delay job until next day

## Retry Strategy
BullMQ built-in retry with exponential backoff:
```typescript
defaultJobOptions: {
  attempts: 4,
  backoff: {
    type: 'exponential',
    delay: 5000,  // 5s, 25s, 125s, 625s
  }
}
```

## Directory Auto-Pause
If failure rate for a directory exceeds threshold (e.g. >50% in last 24 hrs):
1. Set `directories.healthStatus = 'degraded'`
2. Set `directories.paused = true`
3. Alert visible in dashboard
4. All pending jobs for that directory held until unpaused
