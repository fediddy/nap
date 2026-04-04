import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DirectoryConfig } from '@nap/shared';

async function pauseOrResumeDirectory(
  id: string,
  action: 'pause' | 'resume'
): Promise<DirectoryConfig> {
  const res = await fetch(`/api/directories/${id}/${action}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to ${action} directory`);
  const json = await res.json();
  return json.data as DirectoryConfig;
}

export function usePauseDirectory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'pause' | 'resume' }) =>
      pauseOrResumeDirectory(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directories'] });
    },
  });
}
