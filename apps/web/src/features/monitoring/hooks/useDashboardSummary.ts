import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../../../lib/api';

export type SubmissionStatus =
  | 'queued'
  | 'submitting'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'removed';

export interface DashboardSummary {
  totalBusinesses: number;
  activeBusinesses: number;
  totalDirectories: number;
  healthyDirectories: number;
  submissionsByStatus: Record<SubmissionStatus, number>;
  recentActivity: Array<{
    submissionId: string;
    businessName: string;
    directoryName: string;
    status: string;
    updatedAt: string;
  }>;
}

async function fetchSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/api/submissions/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  const json = await res.json();
  return json.data as DashboardSummary;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchSummary,
    staleTime: 30_000,
  });
}
