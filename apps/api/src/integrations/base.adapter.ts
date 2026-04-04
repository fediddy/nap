import type { BusinessProfile } from '@nap/shared';
import type { SubmissionResult, RemovalResult } from '@nap/shared';

export interface DirectoryAdapter {
  readonly slug: string;
  readonly displayName: string;
  readonly type: 'browser' | 'file_export' | 'api';

  /** Submit a new listing for a business */
  submit(business: BusinessProfile): Promise<SubmissionResult>;

  /** Push updated fields to an existing listing */
  update(business: BusinessProfile, externalId: string): Promise<SubmissionResult>;

  /** Remove/claim a listing */
  remove(externalId: string): Promise<RemovalResult>;

  /** Quick health probe (should complete in < 5 seconds) */
  checkHealth(): Promise<'healthy' | 'degraded' | 'down'>;
}
