export type SubmissionStatus =
  | 'queued'
  | 'submitting'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'removed';

export interface SubmissionResult {
  status: SubmissionStatus;
  externalId?: string;
  errorCode?: string;
  message?: string;
}
