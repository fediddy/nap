import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface PushUpdatesResult {
  updated: number;
  failed: number;
  results: Array<{ directorySlug: string; status: string; reason?: string }>;
}

export function usePushUpdates(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post<PushUpdatesResult>(`/api/businesses/${id}/push-updates`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['business-submissions', id] });
    },
  });
}
