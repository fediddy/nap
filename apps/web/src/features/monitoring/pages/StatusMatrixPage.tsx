import { useQueryClient } from '@tanstack/react-query';
import { useStatusMatrix } from '../hooks/useStatusMatrix';
import type { SubmissionStatus } from '../hooks/useDashboardSummary';

const STATUS_CELL_CLASSES: Record<SubmissionStatus, string> = {
  verified: 'bg-green-100 text-green-800',
  submitted: 'bg-indigo-100 text-indigo-800',
  submitting: 'bg-blue-50 text-blue-600',
  queued: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-800',
  requires_action: 'bg-amber-100 text-amber-800',
  removed: 'bg-gray-100 text-gray-400',
};

function StatusCell({ status }: { status: SubmissionStatus | null }) {
  if (!status) {
    return <span className="text-gray-300">—</span>;
  }
  const cls = STATUS_CELL_CLASSES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function StatusMatrixPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useStatusMatrix();

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['status-matrix'] });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-600">
        Failed to load status matrix. Please try again.
      </div>
    );
  }

  // Collect unique businesses and directories, preserving order
  const businessMap = new Map<
    string,
    { id: string; name: string; status: string }
  >();
  const directoryMap = new Map<string, { id: string; name: string }>();

  for (const row of data) {
    if (!businessMap.has(row.businessId)) {
      businessMap.set(row.businessId, {
        id: row.businessId,
        name: row.businessName,
        status: row.businessStatus,
      });
    }
    if (!directoryMap.has(row.directoryId)) {
      directoryMap.set(row.directoryId, {
        id: row.directoryId,
        name: row.directoryName,
      });
    }
  }

  // Sort: active businesses first, then deactivated
  const businesses = Array.from(businessMap.values()).sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name);
    return a.status === 'active' ? -1 : 1;
  });
  const directories = Array.from(directoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Build a lookup map for cell rendering
  const cellMap = new Map<string, { status: SubmissionStatus | null }>();
  for (const row of data) {
    cellMap.set(`${row.businessId}:${row.directoryId}`, { status: row.status });
  }

  const largeGrid = businesses.length > 20 || directories.length > 5;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Status Matrix</h1>
        <button
          onClick={handleRefresh}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Refresh
        </button>
      </div>

      <div
        className={`rounded-lg border border-gray-200 bg-white shadow-sm ${
          largeGrid ? 'overflow-x-auto' : ''
        }`}
      >
        {businesses.length === 0 || directories.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400">
            No data available. Add businesses and directories first.
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                  Business
                </th>
                {directories.map((dir) => (
                  <th
                    key={dir.id}
                    className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-600"
                  >
                    {dir.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr
                  key={business.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    business.status === 'deactivated' ? 'opacity-50' : ''
                  }`}
                >
                  <td className="sticky left-0 bg-white px-4 py-3 font-medium text-gray-900 hover:bg-gray-50">
                    <span>{business.name}</span>
                    {business.status === 'deactivated' && (
                      <span className="ml-2 text-xs text-gray-400">(inactive)</span>
                    )}
                  </td>
                  {directories.map((dir) => {
                    const cell = cellMap.get(`${business.id}:${dir.id}`);
                    return (
                      <td key={dir.id} className="px-4 py-3 text-center">
                        <StatusCell status={cell?.status ?? null} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
