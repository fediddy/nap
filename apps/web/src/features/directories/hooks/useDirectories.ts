import { useQuery } from '@tanstack/react-query';
import type { DirectoryConfig } from '@nap/shared';

async function fetchDirectories(): Promise<{ data: DirectoryConfig[]; meta: { count: number } }> {
  const res = await fetch('/api/directories');
  if (!res.ok) throw new Error('Failed to fetch directories');
  return res.json();
}

export function useDirectories() {
  return useQuery({
    queryKey: ['directories'],
    queryFn: fetchDirectories,
    // Always refetch on every page visit per Story 6.1 AC
    staleTime: 0,
  });
}
