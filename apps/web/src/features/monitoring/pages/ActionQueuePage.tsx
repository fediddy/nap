import { useActionQueue } from '../hooks/useActionQueue';
import { useUpdateSubmission } from '../hooks/useUpdateSubmission';

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === 'failed'
      ? 'bg-red-100 text-red-800'
      : 'bg-orange-100 text-orange-800';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function ActionQueuePage() {
  const { data, isLoading, error } = useActionQueue();
  const updateSubmission = useUpdateSubmission();

  const handleRetry = (submissionId: string) => {
    updateSubmission.mutate({ id: submissionId, payload: { status: 'queued' } });
  };

  const handleDismiss = (submissionId: string) => {
    updateSubmission.mutate({
      id: submissionId,
      payload: { status: 'submitted', message: 'Manually dismissed' },
    });
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500 animate-pulse">Loading action queue...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-600">
        Failed to load action queue. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Action Queue</h1>
        {data.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-0.5 text-sm font-semibold text-orange-800">
            {data.length}
          </span>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-medium text-green-700">
              No pending actions — everything looks good!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Business</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Directory</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Error Code</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Message</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Last Attempt</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={item.submissionId}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.businessName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.directoryName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {item.errorCode ?? '—'}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                      {item.message ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(item.lastAttempt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRetry(item.submissionId)}
                          disabled={updateSubmission.isPending}
                          className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => handleDismiss(item.submissionId)}
                          disabled={updateSubmission.isPending}
                          className="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
