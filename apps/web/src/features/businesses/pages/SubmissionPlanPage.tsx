import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useSubmissionPlan, type PlanAction, type SubmissionStatus } from '../hooks/useSubmissionPlan';
import { useApprovePlan } from '../hooks/useApprovePlan';

function ActionBadge({ action }: { action: PlanAction }) {
  const styles: Record<PlanAction, string> = {
    submit: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    skip: 'bg-gray-100 text-gray-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        styles[action]
      )}
    >
      {action}
    </span>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus | null }) {
  if (!status) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const styles: Record<SubmissionStatus, string> = {
    queued: 'bg-yellow-100 text-yellow-700',
    submitting: 'bg-blue-100 text-blue-600',
    submitted: 'bg-green-100 text-green-700',
    verified: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    requires_action: 'bg-orange-100 text-orange-700',
    removed: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        styles[status]
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-gray-200" />
      ))}
    </div>
  );
}

export default function SubmissionPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plan, isLoading, isError } = useSubmissionPlan(id ?? '');
  const approveMutation = useApprovePlan(id ?? '');

  function handleApprovePlan() {
    approveMutation.mutate(
      {},
      {
        onSuccess: (result) => {
          toast.success(`Plan approved — ${result.queued} submission(s) queued`);
          navigate(`/businesses/${id}`);
        },
        onError: () => {
          toast.error('Failed to approve plan');
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to={`/businesses/${id}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            &larr; Back to Business
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Submission Plan</h1>
            {plan && (
              <p className="mt-1 text-sm text-gray-500">{plan.businessName}</p>
            )}
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : isError || !plan ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-red-600">
                Failed to load submission plan.
              </p>
              <Link
                to={`/businesses/${id}`}
                className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                &larr; Return to Business
              </Link>
            </div>
          ) : (
            <>
              {/* Plan table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr>
                      <th className="pb-3 pl-0 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Directory
                      </th>
                      <th className="pb-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                      <th className="pb-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Reason
                      </th>
                      <th className="pb-3 pl-4 pr-0 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Existing Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plan.planItems.map((item) => (
                      <tr key={item.directoryId} className="hover:bg-gray-50">
                        <td className="py-3 pl-0 pr-4 font-medium text-gray-900">
                          {item.directoryName}
                          <span className="ml-2 text-xs text-gray-400">({item.directorySlug})</span>
                        </td>
                        <td className="py-3 px-4">
                          <ActionBadge action={item.action} />
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.reason}</td>
                        <td className="py-3 pl-4 pr-0">
                          <StatusBadge status={item.existingStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {plan.planItems.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-500">
                    No directories found.
                  </p>
                )}
              </div>

              {/* Approve button */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                  {plan.planItems.filter((i) => i.action !== 'skip').length} director
                  {plan.planItems.filter((i) => i.action !== 'skip').length === 1 ? 'y' : 'ies'} will be queued
                </p>
                <button
                  type="button"
                  onClick={handleApprovePlan}
                  disabled={
                    approveMutation.isPending ||
                    plan.planItems.every((i) => i.action === 'skip')
                  }
                  className={cn(
                    'px-5 py-2.5 rounded-md text-sm font-semibold text-white',
                    'bg-primary-600 hover:bg-primary-700',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {approveMutation.isPending ? 'Approving…' : 'Approve Plan'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
