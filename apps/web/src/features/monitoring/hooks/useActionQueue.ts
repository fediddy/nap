import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../../../lib/api';

export interface ActionItem {
  submissionId: string;
  businessId: string;
  businessName: string;
  directoryId: string;
  directoryName: string;
  status: string;
  errorCode: string | null;
  message: string | null;
  lastAttempt: string | null;
}

async function fetchActions(): Promise<ActionItem[]> {
  const res = await fetch(`${API_BASE}/api/submissions/actions`);
  if (!res.ok) throw new Error('Failed to fetch action queue');
  const json = await res.json();
  return json.data as ActionItem[];
}

export function useActionQueue() {
  return useQuery({
    queryKey: ['action-queue'],
    queryFn: fetchActions,
    staleTime: 0,
  });
}
