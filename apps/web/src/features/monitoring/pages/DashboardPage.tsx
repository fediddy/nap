import { useDashboardSummary } from '../hooks/useDashboardSummary';
import type { SubmissionStatus } from '../hooks/useDashboardSummary';

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  verified: 'bg-green-500',
  submitted: 'bg-blue-500',
  submitting: 'bg-blue-300',
  queued: 'bg-gray-400',
  failed: 'bg-red-500',
  requires_action: 'bg-orange-500',
  removed: 'bg-gray-300',
};

const STATUS_BADGE_CLASSES: Record<SubmissionStatus, string> = {
  verified: 'bg-green-100 text-green-800',
  submitted: 'bg-blue-100 text-blue-800',
  submitting: 'bg-blue-50 text-blue-600',
  queued: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-800',
  requires_action: 'bg-orange-100 text-orange-800',
  removed: 'bg-gray-100 text-gray-500',
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_BADGE_CLASSES[status as SubmissionStatus] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="p-8 text-gray-500 animate-pulse">Loading dashboard...</div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-600">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  const statusEntries = Object.entries(data.submissionsByStatus) as [
    SubmissionStatus,
    number
  ][];
  const totalSubmissions = statusEntries.reduce((acc, [, n]) => acc + n, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Businesses" value={data.totalBusinesses} />
        <StatCard label="Active Businesses" value={data.activeBusinesses} />
        <StatCard label="Total Directories" value={data.totalDirectories} />
        <StatCard label="Healthy Directories" value={data.healthyDirectories} />
      </div>

      {/* Submission Status Breakdown */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Submission Status Breakdown
        </h2>
        {totalSubmissions === 0 ? (
          <p className="text-sm text-gray-400">No submissions yet.</p>
        ) : (
          <>
            {/* Stacked bar */}
            <div className="mb-4 flex h-6 w-full overflow-hidden rounded-full bg-gray-100">
              {statusEntries
                .filter(([, count]) => count > 0)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className={`${STATUS_COLORS[status]} transition-all`}
                    style={{ width: `${(count / totalSubmissions) * 100}%` }}
                    title={`${status}: ${count}`}
                  />
                ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4">
              {statusEntries.map(([status, count]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${STATUS_COLORS[status]}`}
                  />
                  <span className="text-sm text-gray-600">
                    {status.replace('_', ' ')}: <strong>{count}</strong>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        {data.recentActivity.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400">No recent activity.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3 font-medium text-gray-600">Business</th>
                <th className="px-6 py-3 font-medium text-gray-600">Directory</th>
                <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 font-medium text-gray-600">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((row) => (
                <tr
                  key={row.submissionId}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {row.businessName}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{row.directoryName}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {formatDate(row.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
