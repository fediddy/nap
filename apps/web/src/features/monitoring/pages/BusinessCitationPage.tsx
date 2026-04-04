import { Link, useParams } from 'react-router-dom';
import { useBusinessSubmissions } from '../hooks/useBusinessSubmissions';
import { useUpdateSubmission } from '../hooks/useUpdateSubmission';
import type { SubmissionStatus } from '../hooks/useDashboardSummary';

const STATUS_BADGE_CLASSES: Record<SubmissionStatus, string> = {
  verified: 'bg-green-100 text-green-800',
  submitted: 'bg-blue-100 text-blue-800',
  submitting: 'bg-blue-50 text-blue-600',
  queued: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-800',
  requires_action: 'bg-orange-100 text-orange-800',
  removed: 'bg-gray-100 text-gray-500',
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const cls =
    STATUS_BADGE_CLASSES[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function BusinessCitationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useBusinessSubmissions(id);
  const updateSubmission = useUpdateSubmission();

  const handleRetry = (submissionId: string) => {
    updateSubmission.mutate({ id: submissionId, payload: { status: 'queued' } });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-gray-500 animate-pulse">
        Loading citation profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-600">
        Failed to load citation data. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-2">
        <Link
          to={`/businesses/${id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          &larr; Back to business
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Citation Profile</h1>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {data.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400">
            No submissions found for this business.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Directory</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">External ID</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Last Attempt</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Submitted At</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((sub) => (
                  <tr
                    key={sub.submissionId}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {sub.directoryName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {sub.externalId ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(sub.lastAttempt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(sub.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {(sub.status === 'failed' || sub.status === 'requires_action') && (
                        <button
                          onClick={() => handleRetry(sub.submissionId)}
                          disabled={updateSubmission.isPending}
                          className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Retry
                        </button>
                      )}
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
