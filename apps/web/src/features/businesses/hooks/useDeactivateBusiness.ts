import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useDeactivateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.del<{ id: string; status: string }>(`/api/businesses/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}
