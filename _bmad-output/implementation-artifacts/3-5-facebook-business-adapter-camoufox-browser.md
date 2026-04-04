# Story 3.5: Facebook Business Adapter (Browser)
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created `FacebookBusinessAdapter` implementing `DirectoryAdapter` with `slug: 'facebook-business'`, `type: 'browser'`
- `submit()` uses `getOrCreateProfile` + `createBrowserContext` from existing browser infrastructure
- Restores session cookies via `restoreSession()` if `profile.cookiesJson` is non-empty
- Navigates to `https://www.facebook.com/pages/create`; detects login wall by checking if URL includes `/login` and returns `requires_action` status with session-relay message
- Fills business name and category inputs using `humanType()` for human-like keystroke simulation
- On successful page creation: persists updated session cookies via `saveProfile()` and returns `submitted` status with extracted page ID as `externalId`
- Navigation/timeout errors are caught and returned as `failed` with `NAVIGATION_ERROR` code
- `context.close()` is always called in a `finally` block
- `update()` returns `requires_action`; `remove()` returns `not_found` — both require manual action in Facebook Business Manager
- `checkHealth()` uses `fetch` with a 5-second `AbortController` timeout against `https://www.facebook.com/robots.txt`
- Registered in `apps/api/src/integrations/index.ts` at module load
### File List
- `apps/api/src/integrations/facebook.adapter.ts` (created)
- `apps/api/src/integrations/index.ts` (updated)
