# Story 3.2: Session Relay & Cookie Handoff
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- `persistSession` exports cookies from a BrowserContextWrapper and writes them back to the profile JSON file on disk
- `restoreSession` imports cookies into a context, skipping if cookiesJson is empty
- `relaySession` performs a one-step cookie handoff: exports from source context and imports into target context (enables context switching without re-authentication)
- `clearSession` resets `cookiesJson` to empty string in the profile file on disk, forcing fresh login on next run
- All four functions live in `session.ts` alongside the Story 3.1 persist/restore functions
### File List
- apps/api/src/browser/session.ts
