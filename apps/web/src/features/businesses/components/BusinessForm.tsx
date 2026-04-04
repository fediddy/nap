import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { businessProfileSchema, type BusinessProfileInput } from '@nap/shared';
import { cn } from '../../../lib/utils';

interface BusinessFormProps {
  onSubmit: (data: BusinessProfileInput) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<BusinessProfileInput>;
  submitLabel?: string;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

const inputClass = (error?: string) =>
  cn(
    'w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition',
    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    error
      ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
      : 'border-gray-300 bg-white'
  );

export default function BusinessForm({ onSubmit, isSubmitting, defaultValues, submitLabel }: BusinessFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Row 1: Name + Category */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Business Name" error={errors.name?.message} required>
          <input
            {...register('name')}
            type="text"
            placeholder="Acme Plumbing Co."
            className={inputClass(errors.name?.message)}
          />
        </Field>

        <Field label="Category" error={errors.category?.message} required>
          <input
            {...register('category')}
            type="text"
            placeholder="Plumber"
            className={inputClass(errors.category?.message)}
          />
        </Field>
      </div>

      {/* Row 2: Address */}
      <Field label="Street Address" error={errors.address?.message} required>
        <input
          {...register('address')}
          type="text"
          placeholder="123 Main St"
          className={inputClass(errors.address?.message)}
        />
      </Field>

      {/* Row 3: City / State / Zip */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Field label="City" error={errors.city?.message} required>
            <input
              {...register('city')}
              type="text"
              placeholder="Oakland"
              className={inputClass(errors.city?.message)}
            />
          </Field>
        </div>
        <Field label="State" error={errors.state?.message} required>
          <input
            {...register('state')}
            type="text"
            placeholder="CA"
            className={inputClass(errors.state?.message)}
          />
        </Field>
        <Field label="ZIP Code" error={errors.zip?.message} required>
          <input
            {...register('zip')}
            type="text"
            placeholder="94601"
            className={inputClass(errors.zip?.message)}
          />
        </Field>
      </div>

      {/* Row 4: Phone + Website */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Phone Number" error={errors.phone?.message} required>
          <input
            {...register('phone')}
            type="tel"
            placeholder="(555) 555-5555"
            className={inputClass(errors.phone?.message)}
          />
        </Field>

        <Field label="Website URL" error={errors.website?.message}>
          <input
            {...register('website')}
            type="url"
            placeholder="https://example.com"
            className={inputClass(errors.website?.message)}
          />
        </Field>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold text-white',
            'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed transition'
          )}
        >
          {isSubmitting ? 'Saving…' : (submitLabel ?? 'Create Business')}
        </button>
      </div>
    </form>
  );
}
