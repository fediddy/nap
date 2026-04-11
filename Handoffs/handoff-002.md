> Part of [[Handoffs]]

**Date**: April 11, 2026 at 10:16 AM

## Summary

Built the complete multi-account Facebook session relay system from scratch. The pipeline now supports cookie-based browser auth with a DB-backed account pool — users log into Facebook locally, export cookies, POST them to the API, and the adapter reuses them across submissions without re-authenticating. All four feature tasks were completed, reviewed, and committed to main.

## What Was Done

### New Database Objects
- Added `directory_accounts` table to Drizzle schema (`apps/api/src/db/schema.ts`)
- Migration `0005_directory_accounts.sql` — creates table with enum (active/needs_reauth/suspended)
- Migration `0006_directory_accounts_unique.sql` — adds `UNIQUE(slug, label)` constraint
- Slug index (`directory_accounts_slug_idx`) for LRU query performance

### New API Endpoints (`apps/api/src/routes/session-relay.routes.ts`)
- `POST /api/session-relay/:slug` — upserts a session by slug+label; validates cookies as JSON; uses `onConflictDoUpdate` for race-safe upsert; strips `cookiesJson` from response
- `GET /api/session-relay/:slug` — lists all accounts for a directory (no cookies exposed)
- Registered in `apps/api/src/server.ts`

### Facebook Adapter Rewrite (`apps/api/src/integrations/facebook.adapter.ts`)
- Removed file-based profile system (no more `getOrCreateProfile`/`saveProfile`)
- Now queries `directory_accounts` for least-recently-used active Facebook account
- Returns `requires_action` with relay endpoint hint if no account exists
- Detects login wall → marks account `needs_reauth`
- On success: saves updated cookies, increments `pages_created`, sets `last_used_at`

### Commits (all on main)
- `ccddc50` — feat: add directory_accounts table for multi-session browser auth
- `88ec6c6` — fix: add slug index to directory_accounts table
- `98f4ef5` — feat: add session relay endpoint for directory account cookie injection
- (fix commit) — fix: strip cookiesJson from session relay POST responses
- (fix commit) — fix: add unique constraint on slug+label and use onConflictDoUpdate for upsert
- (adapter commit) — feat: update Facebook adapter to use directory_accounts pool

## Decisions Made

- **Bare slug vs FK**: `directory_accounts.slug` is a denormalized varchar (not a FK to `directories.id`) — chosen because adapters use slugs as their natural identifier and the directories table is small/static. Acceptable trade-off.
- **onConflictDoUpdate over select-then-insert**: Eliminates race condition on concurrent POST requests for the same slug+label.
- **cookiesJson never in API responses**: Both POST and GET omit the raw cookie data — destructured out before `reply.send()`.
- **LRU account selection**: `ORDER BY last_used_at ASC NULLS FIRST` distributes load across accounts and prioritizes unused/oldest accounts first.

## Blockers and Open Questions

- **Facebook phone verification**: Creating new Facebook pages may still trigger phone verification on first use. Tracked as Task #1 (RingBa relay — on hold).
- **Yelp adapter**: Still uses file-based profiles — not updated this session. Should be migrated to `directory_accounts` in a future session if Yelp needs multi-account support.
- **No migration has been run in prod yet**: The new tables (`directory_accounts`) exist in code but haven't been deployed. Next deploy will run `migrate.js` automatically via the Dockerfile CMD.

## Recommended Next Steps

1. **Deploy to production** — push to Coolify, migrations run automatically. Verify `directory_accounts` table exists in prod DB.
2. **Inject a Facebook session** — log into Facebook locally, export cookies with a browser extension, POST to `POST /api/session-relay/facebook` with `{ label: "account1", cookies: "[...]" }`.
3. **Test end-to-end** — approve a plan for a business, confirm the Facebook adapter picks up the account and attempts page creation.
4. **Yelp adapter migration** — migrate Yelp to use `directory_accounts` the same way Facebook now does (same pattern, slug = 'yelp').
5. **Epic 5: Monitoring** — once submission pipeline is stable, build out real data for dashboard, status matrix, and action queue pages.

## Files to Read on Resume

- [[Execution-Plan]] — current build priority
- `apps/api/src/routes/session-relay.routes.ts` — the new relay endpoint
- `apps/api/src/integrations/facebook.adapter.ts` — updated adapter
- `apps/api/src/db/schema.ts` — directoryAccounts table definition
