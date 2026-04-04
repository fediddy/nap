import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useBusinessById } from '../hooks/useBusinessById';
import { useUpdateBusiness } from '../hooks/useUpdateBusiness';
import { useDeactivateBusiness } from '../hooks/useDeactivateBusiness';
import BusinessForm from '../components/BusinessForm';
import type { BusinessProfile } from '@nap/shared';
import type { BusinessProfileInput } from '@nap/shared';

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

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-1/4 rounded bg-gray-200" />
            <div className="h-5 w-3/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  );
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: business, isLoading, isError } = useBusinessById(id ?? '');
  const updateMutation = useUpdateBusiness(id ?? '');
  const deactivateMutation = useDeactivateBusiness();

  function handleEditSubmit(data: BusinessProfileInput) {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Business updated');
        setIsEditing(false);
      },
      onError: () => {
        toast.error('Failed to update business');
      },
    });
  }

  function handleConfirmDeactivate() {
    if (!id) return;
    deactivateMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Business deactivated');
        navigate('/businesses');
      },
      onError: () => {
        toast.error('Failed to deactivate business');
        setShowConfirmDialog(false);
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/businesses"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            &larr; Back to Businesses
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          {isLoading ? (
            <SkeletonDetail />
          ) : isError || !business ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-red-600">Business not found or failed to load.</p>
              <Link
                to="/businesses"
                className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                &larr; Return to Businesses
              </Link>
            </div>
          ) : isEditing ? (
            /* Edit mode */
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Business Profile</h1>

              {business.status === 'deactivated' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm">
                  This business is deactivated. Re-activate before submitting to directories.
                </div>
              )}

              <BusinessForm
                onSubmit={handleEditSubmit}
                isSubmitting={updateMutation.isPending}
                submitLabel="Save Changes"
                defaultValues={{
                  name: business.name,
                  address: business.address,
                  city: business.city,
                  state: business.state,
                  zip: business.zip,
                  phone: business.phone,
                  category: business.category,
                  website: business.website ?? undefined,
                }}
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                  {business.status === 'deactivated' && (
                    <StatusBadge status="deactivated" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-semibold text-white',
                      'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition'
                    )}
                  >
                    Edit
                  </button>
                  {business.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmDialog(true)}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-semibold',
                        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                        'focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition'
                      )}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>

              {business.status === 'deactivated' && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm">
                  This business is deactivated. It will not be submitted to any directories.
                </div>
              )}

              {/* Detail grid */}
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <DetailField label="Business Name">{business.name}</DetailField>
                <DetailField label="Category">{business.category}</DetailField>
                <DetailField label="Address">
                  {business.address}, {business.city}, {business.state} {business.zip}
                </DetailField>
                <DetailField label="Phone">{business.phone}</DetailField>
                <DetailField label="Website">
                  {business.website ? (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {business.website}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </DetailField>
                <DetailField label="Status">
                  <StatusBadge status={business.status} />
                </DetailField>
                <DetailField label="Created">
                  {new Date(business.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </DetailField>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirmDialog && business && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Deactivate Business</h2>
            <p className="mt-3 text-sm text-gray-600">
              This will mark <span className="font-medium">{business.name}</span> as deactivated.
              Directory listings will not be removed automatically — use the Lifecycle Management
              section for that.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 rounded-md text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50"
              >
                {deactivateMutation.isPending ? 'Deactivating…' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
