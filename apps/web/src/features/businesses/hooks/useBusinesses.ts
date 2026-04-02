import { useQuery } from '@tanstack/react-query';
import type { BusinessProfile } from '@nap/shared';

export interface BusinessesParams {
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

async function fetchBusinesses(params: BusinessesParams): Promise<{ data: BusinessProfile[]; meta: { count: number } }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.category) qs.set('category', params.category);
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortDir) qs.set('sortDir', params.sortDir);

  const res = await fetch(`/api/businesses?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch businesses');
  return res.json();
}

export function useBusinesses(params: BusinessesParams) {
  return useQuery({
    queryKey: ['businesses', params],
    queryFn: () => fetchBusinesses(params),
    staleTime: 30_000,
  });
}
