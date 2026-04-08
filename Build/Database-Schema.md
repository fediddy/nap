> Part of [[Build]]

# Database Schema

Schema lives in `apps/api/src/db/schema.ts`. Current tables:

## businesses
Core business profile table.
- `id` (uuid, PK)
- `name`, `address`, `city`, `state`, `zip`, `phone`, `website`
- `category` (business type/niche)
- `status` (active/inactive)
- `createdAt`, `updatedAt`

## directories
Registry of submission targets.
- `id` (uuid, PK)
- `name`, `slug` (unique)
- `type` (api | browser | file_export)
- `apiConfig` (JSONB — loginUrl, submitUrl, exportFormat)
- `rateLimits` (JSONB — requestsPerMinute, delayMs)
- `healthStatus` (healthy | degraded | down)
- `paused` (boolean)

## submissions
Tracks per-business × per-directory submission state.
- `id`, `businessId` (FK), `directoryId` (FK)
- `status` (pending | submitted | verified | failed | needs_action)
- `attemptCount`, `lastError`
- `submittedAt`, `verifiedAt`

## Migrations
- `0000_motionless_wonder_man` — Initial schema (businesses + directories + submissions)
- `0001_blue_lady_deathstrike` — Additional fields
- `0002_submissions_table` — Submissions table
- `0003_seed_directories` — 6 core directories seeded
- `0004_seed_more_directories` — 20 additional directories seeded
