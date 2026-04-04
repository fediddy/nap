import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { BusinessProfile } from '@nap/shared';

export function useBusinessById(id: string) {
  return useQuery({
    queryKey: ['businesses', id],
    queryFn: () => api.get<BusinessProfile>(`/api/businesses/${id}`),
    enabled: Boolean(id),
  });
}
