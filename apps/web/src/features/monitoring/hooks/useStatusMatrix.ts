import { useQuery } from '@tanstack/react-query';
import type { SubmissionStatus } from './useDashboardSummary';

export interface MatrixRow {
  businessId: string;
  businessName: string;
  businessStatus: string;
  directoryId: string;
  directoryName: string;
  status: SubmissionStatus | null;
  submissionId: string | null;
  externalId: string | null;
  lastAttempt: string | null;
}

async function fetchMatrix(): Promise<MatrixRow[]> {
  const res = await fetch('/api/submissions/matrix');
  if (!res.ok) throw new Error('Failed to fetch status matrix');
  const json = await res.json();
  return json.data as MatrixRow[];
}

export function useStatusMatrix() {
  return useQuery({
    queryKey: ['status-matrix'],
    queryFn: fetchMatrix,
    staleTime: 30_000,
  });
}
