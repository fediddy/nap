# Story 3.3: Directory Adapter Pattern & Base Infrastructure
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Added `submissionStatusEnum` pgEnum and `submissions` pgTable to the Drizzle schema with all required columns (id, businessId, directoryId, status, externalId, errorCode, message, submittedAt, verifiedAt, lastAttempt, createdAt, updatedAt)
- Added `Submission` and `NewSubmission` inferred type exports to schema.ts
- Added `RemovalResult` interface to `packages/shared/src/types/submission.types.ts`
- Created manual SQL migration `0002_submissions_table.sql` with CREATE TYPE and CREATE TABLE statements
- Updated `_journal.json` with idx=2 entry for the new migration
- `DirectoryAdapter` interface defines the contract for all directory integrations: `submit`, `update`, `remove`, `checkHealth`
- Adapter registry in `integrations/index.ts` provides `registerAdapter`, `getAdapter`, `getAllAdapters` via a module-level Map
### File List
- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/0002_submissions_table.sql
- apps/api/drizzle/migrations/meta/_journal.json
- packages/shared/src/types/submission.types.ts
- apps/api/src/integrations/base.adapter.ts
- apps/api/src/integrations/index.ts
