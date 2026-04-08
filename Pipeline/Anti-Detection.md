> Part of [[Pipeline]]

# Anti-Detection Strategy

## Why This Matters
Browser-automated directory submissions look like bots. Directories will block, rate-limit, or ban accounts that submit too fast or from data-center IPs.

## Camoufox
Anti-detection browser (Firefox-based). Story 3.1 covers integration.
- Fingerprint randomization
- Realistic browser headers
- Passes basic bot detection tests
- Used for all `type: browser` adapters

## Proxy Strategy
**Required for browser automation at scale.**
- Use residential proxy pool (not data-center IPs)
- Rotate proxy per submission session
- Per-directory IP pools (don't reuse same IP across directories)
- Proxy providers: Bright Data, Oxylabs, Smartproxy

## Rate Limiting Rules
| Directory Tier | Max/Day | Min Delay |
|----------------|---------|-----------|
| High-scrutiny (Google, Facebook) | 3-5 | 30-60s randomized |
| Medium-scrutiny (Yelp, BBB) | 5-8 | 10-20s randomized |
| Low-scrutiny (Manta, Hotfrog) | 10-15 | 6-10s randomized |

## Human-Like Behavior
- Randomized delays between clicks (not fixed ms)
- Occasional mouse movement simulation
- Don't fill forms instantly — type at realistic speed
- Random scroll behavior before submitting

## Account Management
- Multiple accounts per directory (rotate when one gets flagged)
- Never reuse account credentials across directories
- NapBrowserProfile stores per-account session data
- If account suspended → flag in directory health, switch to backup account
