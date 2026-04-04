import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubmissionStatus } from './useDashboardSummary';

interface UpdateSubmissionPayload {
  status: SubmissionStatus;
  message?: string;
}

async function updateSubmission(
  id: string,
  payload: UpdateSubmissionPayload
): Promise<unknown> {
  const res = await fetch(`/api/submissions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update submission');
  const json = await res.json();
  return json.data;
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSubmissionPayload;
    }) => updateSubmission(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['action-queue'] });
      void queryClient.invalidateQueries({ queryKey: ['status-matrix'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
