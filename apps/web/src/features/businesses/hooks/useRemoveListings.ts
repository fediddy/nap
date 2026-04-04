import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface RemoveListingsResult {
  removed: number;
  failed: number;
  skipped: number;
  results: Array<{ directorySlug: string; status: string }>;
}

export function useRemoveListings(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { force?: boolean }) =>
      api.post<RemoveListingsResult>(`/api/businesses/${id}/remove-listings`, options ?? {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['business-submissions', id] });
      void queryClient.invalidateQueries({ queryKey: ['status-matrix'] });
    },
  });
}
