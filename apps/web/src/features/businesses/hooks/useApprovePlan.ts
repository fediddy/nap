import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface ApprovePlanBody {
  directoryIds?: string[];
}

interface ApprovePlanResult {
  queued: number;
  directoryIds: string[];
}

export function useApprovePlan(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ApprovePlanBody = {}) =>
      api.post<ApprovePlanResult>(`/api/businesses/${businessId}/approve-plan`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['submission-plan', businessId] });
      void queryClient.invalidateQueries({ queryKey: ['business-submissions', businessId] });
    },
  });
}
