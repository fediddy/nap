> Part of [[Directories]]

# Automation Strategy

## Integration Type Decision Tree

```
Does the directory have a public API?
  YES → api type — direct HTTP calls, cleanest
  NO  → Does it accept file uploads (CSV/bulk)?
          YES → file_export type — generate + upload
          NO  → browser type — Playwright + Camoufox
```

## Type: api
- Direct HTTP integration
- Lowest maintenance burden
- Examples: Apple Maps Connect, Data Axle (paid), Neustar (paid)
- Implementation: service class with fetch/axios

## Type: file_export
- Generate formatted file (CSV, XML) → upload to directory portal
- Medium maintenance — portal UI may change, but data format is stable
- Examples: Bing Places (CSV import)
- Implementation: CSV generator + file upload flow

## Type: browser
- Playwright + Camoufox (anti-detection browser)
- Highest maintenance — any UI change breaks the adapter
- Budget ~5-10 hrs/month maintenance per adapter at scale
- Examples: Yelp, Facebook, Google Business Profile, Nextdoor
- Anti-detection requirements:
  - Proxy rotation (residential IPs)
  - Human-like delays (randomized, not fixed)
  - Per-directory daily caps (5-10 new listings/day max)
  - Session/cookie management (NapBrowserProfile)

## Rate Limiting Config (in directory.rateLimits)
- `requestsPerMinute`: how many submissions per minute
- `delayMs`: minimum delay between requests

## Maintenance Risk Matrix
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Directory UI change | Adapter breaks | Health monitoring + auto-pause + alerts |
| IP blocking | All submissions fail | Proxy rotation |
| Account suspension | Total integration loss | Multiple account strategy |
| API deprecation | api type adapters break | Fallback to browser adapter |
