import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { BusinessProfile, BusinessProfileInput } from '@nap/shared';

export function useUpdateBusiness(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BusinessProfileInput) =>
      api.put<BusinessProfile>(`/api/businesses/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['businesses'] });
      void queryClient.invalidateQueries({ queryKey: ['businesses', id] });
    },
  });
}
