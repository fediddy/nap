import { useQuery } from '@tanstack/react-query';

export interface NapIssue {
  field: 'phone' | 'address' | 'website' | 'name';
  issue: string;
}

export interface NapConsistencyResult {
  businessId: string;
  businessName: string;
  issues: NapIssue[];
}

export interface NapConsistencyResponse {
  data: NapConsistencyResult[];
  meta: {
    totalChecked: number;
    issuesFound: number;
  };
}

async function fetchNapConsistency(): Promise<NapConsistencyResponse> {
  const res = await fetch('/api/export/nap-consistency');
  if (!res.ok) throw new Error('Failed to run NAP consistency check');
  return res.json();
}

export function useNapConsistency() {
  return useQuery({
    queryKey: ['nap-consistency'],
    queryFn: fetchNapConsistency,
    staleTime: 60_000,
    enabled: false,
  });
}
