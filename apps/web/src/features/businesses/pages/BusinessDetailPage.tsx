import { useParams, Link } from 'react-router-dom';

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <Link
            to="/businesses/new"
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            + Add Another
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">Business ID: <span className="font-mono text-gray-700">{id}</span></p>
          <p className="mt-4 text-sm text-gray-500">
            Full detail view coming in Story 1.3.
          </p>
        </div>
      </div>
    </div>
  );
}
