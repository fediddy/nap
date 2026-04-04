import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface PauseResumeResult {
  paused?: number;
  resumed?: number;
  message: string;
}

export function usePauseSubmissions(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post<PauseResumeResult>(`/api/businesses/${id}/pause-submissions`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['business-submissions', id] });
    },
  });
}

export function useResumeSubmissions(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.post<PauseResumeResult>(`/api/businesses/${id}/resume-submissions`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['business-submissions', id] });
    },
  });
}
