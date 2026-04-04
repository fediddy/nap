# Story 3.6: Yelp Business Adapter (Browser)
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created `YelpBusinessAdapter` implementing `DirectoryAdapter` with `slug: 'yelp-business'`, `type: 'browser'`
- `submit()` uses `getOrCreateProfile` + `createBrowserContext` from existing browser infrastructure
- Restores session cookies via `restoreSession()` if `profile.cookiesJson` is non-empty
- Navigates to `https://biz.yelp.com/claim`; detects login wall by checking if URL includes `/login` and returns `requires_action`
- Searches for an existing business by name + city/state using the claim page search form
- If a claim button is found in search results, clicks it and returns `submitted` with message "Claim initiated"
- If no match found, falls back to navigating to `https://biz.yelp.com/signup` and fills business name, phone, and address fields
- Session cookies are persisted via `saveProfile()` after successful actions
- Navigation/timeout errors caught and returned as `failed` with `NAVIGATION_ERROR` code
- `context.close()` is always called in a `finally` block
- `update()` returns `requires_action`; `remove()` returns `not_found` — both require manual action
- `checkHealth()` uses `fetch` with a 5-second `AbortController` timeout against `https://biz.yelp.com/robots.txt`
- Registered in `apps/api/src/integrations/index.ts` at module load
### File List
- `apps/api/src/integrations/yelp.adapter.ts` (created)
- `apps/api/src/integrations/index.ts` (updated)
