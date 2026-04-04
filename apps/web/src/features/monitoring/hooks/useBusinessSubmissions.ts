import { useQuery } from '@tanstack/react-query';
import type { SubmissionStatus } from './useDashboardSummary';

export interface BusinessSubmission {
  submissionId: string;
  directoryId: string;
  directoryName: string;
  directorySlug: string;
  status: SubmissionStatus;
  externalId: string | null;
  errorCode: string | null;
  message: string | null;
  lastAttempt: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
}

async function fetchBusinessSubmissions(id: string): Promise<BusinessSubmission[]> {
  const res = await fetch(`/api/businesses/${id}/submissions`);
  if (!res.ok) throw new Error('Failed to fetch business submissions');
  const json = await res.json();
  return json.data as BusinessSubmission[];
}

export function useBusinessSubmissions(id: string | undefined) {
  return useQuery({
    queryKey: ['business-submissions', id],
    queryFn: () => fetchBusinessSubmissions(id!),
    enabled: !!id,
  });
}
