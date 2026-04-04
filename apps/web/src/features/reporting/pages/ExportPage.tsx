import { useState } from 'react';
import { useExportBusinesses } from '../hooks/useExportBusinesses';
import { useNapConsistency } from '../hooks/useNapConsistency';

export default function ExportPage() {
  const [includeSubmissions, setIncludeSubmissions] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { exportCsv } = useExportBusinesses();
  const { data: consistencyData, isFetching: consistencyLoading, isError: consistencyError, refetch } = useNapConsistency();

  async function handleDownload() {
    setExportLoading(true);
    setExportError(null);
    try {
      await exportCsv({ includeSubmissions, status: statusFilter || undefined });
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  function handleRunCheck() {
    refetch();
  }

  const issues = consistencyData?.data ?? [];
  const meta = consistencyData?.meta;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Export Data</h1>

        {/* CSV Download Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Business CSV</h2>

          <div className="space-y-4">
            {/* Include submissions checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSubmissions}
                onChange={(e) => setIncludeSubmissions(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include submission status columns</span>
            </label>

            {/* Status radio group */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Business scope</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                {[
                  { value: '', label: 'All businesses' },
                  { value: 'active', label: 'Active only' },
                  { value: 'deactivated', label: 'Deactivated only' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="statusFilter"
                      value={opt.value}
                      checked={statusFilter === opt.value}
                      onChange={() => setStatusFilter(opt.value)}
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {exportError && (
              <p className="text-sm text-red-600">{exportError}</p>
            )}

            <button
              onClick={handleDownload}
              disabled={exportLoading}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exportLoading ? 'Downloading…' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* NAP Consistency Check Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">NAP Consistency Check</h2>

            {meta && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {meta.issuesFound} issue{meta.issuesFound !== 1 ? 's' : ''} found across {meta.totalChecked} business{meta.totalChecked !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          <button
            onClick={handleRunCheck}
            disabled={consistencyLoading}
            className="mb-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {consistencyLoading ? 'Running…' : 'Run Check'}
          </button>

          {consistencyError && (
            <p className="text-sm text-red-600 mb-4">Failed to run consistency check. Please try again.</p>
          )}

          {consistencyLoading && (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded bg-gray-100" />
              ))}
            </div>
          )}

          {!consistencyLoading && consistencyData && (
            issues.length === 0 ? (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                All {meta?.totalChecked ?? 0} business{(meta?.totalChecked ?? 0) !== 1 ? 'es' : ''} passed consistency checks.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg ring-1 ring-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Business Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Issues
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {issues.map((result) => (
                      <tr key={result.businessId} className="align-top">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {result.businessName}
                        </td>
                        <td className="px-4 py-3">
                          <ul className="space-y-1">
                            {result.issues.map((issue, idx) => (
                              <li key={idx} className="text-sm text-gray-600">
                                <span className="font-medium capitalize text-gray-800">{issue.field}:</span>{' '}
                                {issue.issue}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
