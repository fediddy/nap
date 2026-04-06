import { useEffect } from 'react';
import { API_BASE } from '../../../lib/api';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AddDirectoryFormValues {
  name: string;
  slug: string;
  type: 'browser' | 'file_export' | 'api';
  dailyCap: number;
  timeoutSeconds: number;
  notes: string;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function AddDirectoryPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddDirectoryFormValues>({
    defaultValues: {
      name: '',
      slug: '',
      type: 'browser',
      dailyCap: 10,
      timeoutSeconds: 30,
      notes: '',
    },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  // Auto-generate slug from name, but only if slug hasn't been manually overridden
  useEffect(() => {
    const generated = toSlug(nameValue);
    // Only auto-update if the current slug matches what we'd generate from any prior name value
    // We track this simply: if slug is empty or matches the generated slug pattern, update it
    if (!slugValue || slugValue === toSlug(nameValue.slice(0, -1)) || slugValue === generated) {
      setValue('slug', generated, { shouldValidate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue]);

  async function onSubmit(values: AddDirectoryFormValues) {
    try {
      const res = await fetch(`${API_BASE}/api/directories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug,
          type: values.type,
          rateLimits: {
            dailyCap: values.dailyCap,
            timeoutSeconds: values.timeoutSeconds,
          },
          notes: values.notes || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Request failed with status ${res.status}`);
      }

      toast.success('Directory added successfully');
      navigate('/directories');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add directory');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/directories" className="mb-2 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
            ← Back to Directories
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Register a new directory in the citation registry.</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Google Business Profile"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                id="slug"
                type="text"
                {...register('slug', {
                  required: 'Slug is required',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Slug may only contain lowercase letters, numbers, and hyphens',
                  },
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. google-business-profile"
              />
              <p className="mt-0.5 text-xs text-gray-400">Auto-generated from name; lowercase letters, numbers, and hyphens only.</p>
              {errors.slug && (
                <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                {...register('type', { required: 'Type is required' })}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              >
                <option value="browser">Browser</option>
                <option value="file_export">File Export</option>
                <option value="api">API</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Daily Cap + Timeout side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dailyCap" className="block text-sm font-medium text-gray-700">
                  Daily Cap
                </label>
                <input
                  id="dailyCap"
                  type="number"
                  min={1}
                  {...register('dailyCap', {
                    required: 'Daily cap is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    valueAsNumber: true,
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                {errors.dailyCap && (
                  <p className="mt-1 text-xs text-red-600">{errors.dailyCap.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="timeoutSeconds" className="block text-sm font-medium text-gray-700">
                  Timeout (seconds)
                </label>
                <input
                  id="timeoutSeconds"
                  type="number"
                  min={1}
                  {...register('timeoutSeconds', {
                    required: 'Timeout is required',
                    min: { value: 1, message: 'Must be at least 1' },
                    valueAsNumber: true,
                  })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                {errors.timeoutSeconds && (
                  <p className="mt-1 text-xs text-red-600">{errors.timeoutSeconds.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                placeholder="Any additional notes about this directory…"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/directories"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  'Add Directory'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
