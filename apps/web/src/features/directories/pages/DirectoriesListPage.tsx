import { Link } from 'react-router-dom';
import { useDirectories } from '../hooks/useDirectories';
import { usePauseDirectory } from '../hooks/usePauseDirectory';
import type { DirectoryConfig } from '@nap/shared';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-200" style={{ width: `${55 + (i * 13) % 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

function TypeBadge({ type }: { type: DirectoryConfig['type'] }) {
  const styles: Record<DirectoryConfig['type'], string> = {
    browser: 'bg-purple-100 text-purple-700',
    file_export: 'bg-blue-100 text-blue-700',
    api: 'bg-green-100 text-green-700',
  };
  const labels: Record<DirectoryConfig['type'], string> = {
    browser: 'Browser',
    file_export: 'File Export',
    api: 'API',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function HealthBadge({ status }: { status: DirectoryConfig['healthStatus'] }) {
  const styles: Record<DirectoryConfig['healthStatus'], string> = {
    healthy: 'bg-green-100 text-green-700',
    degraded: 'bg-yellow-100 text-yellow-700',
    down: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatLastCheck(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString();
}

export default function DirectoriesListPage() {
  const { data, isLoading, isError } = useDirectories();
  const { mutate: togglePause, isPending, variables } = usePauseDirectory();

  const directories = data?.data ?? [];
  const count = data?.meta.count ?? 0;

  function handleToggle(dir: DirectoryConfig) {
    togglePause({ id: dir.id, action: dir.paused ? 'resume' : 'pause' });
  }

  function isMutatingRow(id: string): boolean {
    return isPending && variables?.id === id;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Directories</h1>
            {!isLoading && (
              <p className="mt-0.5 text-sm text-gray-500">
                {count} director{count !== 1 ? 'ies' : 'y'}
              </p>
            )}
          </div>
          <Link
            to="/directories/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            + Add Directory
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          {isError ? (
            <div className="px-6 py-12 text-center text-sm text-red-600">
              Failed to load directories. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Health</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Daily Cap</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Last Check</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : directories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-sm font-medium text-gray-500">
                          No directories registered yet — add one to get started.
                        </p>
                        <Link
                          to="/directories/new"
                          className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                        >
                          + Add Directory
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    directories.map((dir) => (
                      <tr key={dir.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{dir.name}</span>
                          <span className="ml-2 text-xs text-gray-400">{dir.slug}</span>
                        </td>
                        <td className="px-4 py-3">
                          <TypeBadge type={dir.type} />
                        </td>
                        <td className="px-4 py-3">
                          <HealthBadge status={dir.healthStatus} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {dir.rateLimits.dailyCap}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatLastCheck(dir.lastHealthCheck)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggle(dir)}
                            disabled={isMutatingRow(dir.id)}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                              dir.paused
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {isMutatingRow(dir.id) ? (
                              <>
                                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                {dir.paused ? 'Resuming…' : 'Pausing…'}
                              </>
                            ) : dir.paused ? (
                              'Paused'
                            ) : (
                              'Active'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
