> Part of [[Monitoring]]

# Dashboard Design

## Summary Dashboard (Story 5.1 — /dashboard)
Top-level stats:
- Total businesses managed
- Fully cited count (all Tier 1 directories verified)
- Pending submissions count
- Failed / needs-action count
- Directory health overview (any down/paused)

## Status Matrix (Story 5.2 — /matrix)
Grid view: rows = businesses, columns = directories
Each cell: color-coded status icon
- Green ✓ = verified
- Yellow ⏳ = pending/submitted
- Red ✗ = failed
- Orange ! = needs action
- Gray — = not submitted / not applicable

Filter by: business name, category, directory, status

## Action Queue (Story 5.3 — /actions)
Prioritized list of items requiring manual intervention:
- Email confirmation clicks
- Phone verification calls
- CAPTCHA fallthrough
- Manual form submissions for directories that blocked automation

Each item shows: business name, directory, error message, direct link to directory, age of item

## Per-Business Citation Profile (Story 5.4 — /businesses/:id/citations)
Full citation timeline for one business:
- All directories with current status
- Last verified timestamp per directory
- Submission history (attempts, errors)
- NAP consistency check (does data match what's listed?)

## Batch Status View (Story 5.5)
Per CSV import batch:
- Import timestamp
- Total businesses in batch
- Submissions pending / submitted / verified / failed count
- Progress bar
