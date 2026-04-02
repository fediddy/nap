import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BusinessForm from '../components/BusinessForm';
import { useCreateBusiness } from '../hooks/useCreateBusiness';
import type { BusinessProfileInput } from '@nap/shared';

export default function NewBusinessPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateBusiness();

  function handleSubmit(data: BusinessProfileInput) {
    mutate(data, {
      onSuccess: (business) => {
        toast.success('Business created successfully');
        navigate(`/businesses/${business.id}`);
      },
      onError: (err) => {
        toast.error(err.message ?? 'Failed to create business');
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add Business Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new business profile to submit to directories.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <BusinessForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </div>
      </div>
    </div>
  );
}
