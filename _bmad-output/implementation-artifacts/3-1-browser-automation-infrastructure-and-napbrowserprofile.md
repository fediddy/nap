# Story 3.1: Browser Automation Infrastructure & NAPBrowserProfile
Status: done
## Dev Agent Record
### Agent Model Used
claude-sonnet-4-6
### Completion Notes List
- Created `NAPBrowserProfile` interface with businessId, directorySlug, userAgent, viewport, locale, timezone, cookiesJson, createdAt fields
- `getOrCreateProfile` reads from `browser-profiles/{businessId}-{directorySlug}.json`, falling back to creating a randomised profile
- `saveProfile` ensures `browser-profiles/` directory exists via `mkdir({ recursive: true })` before writing
- Profile rotation uses 5 Firefox 122-126 UA strings, 4 viewports, 3 locales, 4 timezones
- `BrowserContextWrapper` interface wraps a Playwright context with `page()`, `close()`, `exportCookies()`, `importCookies()`
- `createBrowserContext` launches real Chromium with profile settings; when `DRY_RUN=true` returns a Proxy-based stub that logs all page method calls
- `humanType` helper types each character with 40-110ms random delay; every 20th character has 1-in-20 chance of injecting a typo + Backspace
- All imports use `.js` extensions per ESM module convention
### File List
- apps/api/src/browser/profile.ts
- apps/api/src/browser/engine.ts
