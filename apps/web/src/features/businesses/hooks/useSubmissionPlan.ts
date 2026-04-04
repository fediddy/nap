import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export type SubmissionStatus =
  | 'queued'
  | 'submitting'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'removed';

export type PlanAction = 'submit' | 'update' | 'skip';

export interface PlanItem {
  directoryId: string;
  directoryName: string;
  directorySlug: string;
  action: PlanAction;
  reason: string;
  existingStatus: SubmissionStatus | null;
  externalId: string | null;
}

export interface SubmissionPlan {
  businessId: string;
  businessName: string;
  planItems: PlanItem[];
}

export function useSubmissionPlan(businessId: string) {
  return useQuery({
    queryKey: ['submission-plan', businessId],
    queryFn: () => api.get<SubmissionPlan>(`/api/businesses/${businessId}/plan`),
    staleTime: 0, // always fresh
    enabled: !!businessId,
  });
}
