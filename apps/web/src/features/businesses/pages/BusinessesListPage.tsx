import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBusinesses } from '../hooks/useBusinesses';
import { useDebounce } from '../../../hooks/useDebounce';
import { cn } from '../../../lib/utils';
import type { BusinessProfile } from '@nap/shared';

type SortKey = 'name' | 'category' | 'status' | 'createdAt';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-200" style={{ width: `${60 + (i * 11) % 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }: { status: BusinessProfile['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'active'
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      )}
    >
      {status}
    </span>
  );
}

interface SortHeaderProps {
  label: string;
  column: SortKey;
  sortBy: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (col: SortKey) => void;
}

function SortHeader({ label, column, sortBy, sortDir, onSort }: SortHeaderProps) {
  const active = sortBy === column;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
      onClick={() => onSort(column)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="text-gray-300">
          {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}

export default function BusinessesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useBusinesses({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    sortBy,
    sortDir,
  });

  function handleSort(col: SortKey) {
    if (col === sortBy) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }

  const businesses = data?.data ?? [];
  const count = data?.meta.count ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Profiles</h1>
            {!isLoading && (
              <p className="mt-0.5 text-sm text-gray-500">{count} profile{count !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              to="/businesses/import"
              className="inline-flex items-center rounded-md border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
            >
              + Import CSV
            </Link>
            <Link
              to="/businesses/new"
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              + Add Business
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address…"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category…"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          {isError ? (
            <div className="px-6 py-12 text-center text-sm text-red-600">
              Failed to load businesses. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortHeader label="Business Name" column="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Address</th>
                    <SortHeader label="Category" column="category" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                    <SortHeader label="Status" column="status" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <SortHeader label="Created" column="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : businesses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="text-sm font-medium text-gray-500">No businesses found</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {search || statusFilter || categoryFilter
                            ? 'Try adjusting your filters.'
                            : 'Get started by adding your first business profile.'}
                        </p>
                        {!search && !statusFilter && !categoryFilter && (
                          <Link
                            to="/businesses/new"
                            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                          >
                            + Add Business
                          </Link>
                        )}
                      </td>
                    </tr>
                  ) : (
                    businesses.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link to={`/businesses/${b.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                            {b.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {b.address}, {b.city}, {b.state} {b.zip}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{b.phone}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(b.createdAt).toLocaleDateString()}
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
