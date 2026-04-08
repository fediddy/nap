> Part of [[Pipeline]]

# Adapter Pattern

Each directory integration is an "adapter" that implements a common interface.

## Interface (Story 3.3)
```typescript
interface DirectoryAdapter {
  directorySlug: string;
  
  // Submit a new business listing
  submit(business: BusinessProfile): Promise<SubmissionResult>;
  
  // Update an existing listing
  update(business: BusinessProfile, listingId: string): Promise<SubmissionResult>;
  
  // Remove a listing
  remove(listingId: string): Promise<void>;
  
  // Check if listing exists and return current status
  verify(business: BusinessProfile): Promise<VerificationResult>;
}

interface SubmissionResult {
  success: boolean;
  listingId?: string;
  status: 'submitted' | 'verified' | 'needs_action' | 'failed';
  error?: string;
  actionRequired?: string; // e.g. "Confirm email sent to owner@domain.com"
}
```

## Adapters Planned
| Adapter | Story | Type | Complexity |
|---------|-------|------|-----------|
| BingPlaces | 3.4 | file_export | Low — generate CSV, upload |
| Facebook | 3.5 | browser | High — Camoufox, auth flow |
| Yelp | 3.6 | browser | High — Camoufox, claim flow |
| Google Business | TBD | browser | Very high — anti-spam, phone verify |
| Apple Maps | TBD | api | Medium — Maps Connect API |

## NapBrowserProfile (Story 3.1)
Shared browser session management for Camoufox:
- Stores cookies/session per directory per "account"
- Enables session reuse (don't re-login every submission)
- Handles cookie handoff between submissions (Story 3.2)
- Lives in `apps/api/src/services/browser/`

## Adapter Registration
Each adapter registered in a factory/registry:
```typescript
// apps/api/src/services/adapters/registry.ts
const adapters: Record<string, DirectoryAdapter> = {
  'bing-places': new BingPlacesAdapter(),
  'facebook': new FacebookAdapter(),
  'yelp': new YelpAdapter(),
};
```
