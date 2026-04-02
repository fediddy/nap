import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { BusinessProfile, BusinessProfileInput } from '@nap/shared';

export function useCreateBusiness() {
  return useMutation({
    mutationFn: (data: BusinessProfileInput) =>
      api.post<BusinessProfile>('/api/businesses', data),
  });
}
