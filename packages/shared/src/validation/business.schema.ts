import { z } from 'zod';

// Accepts: (555) 555-5555, 555-555-5555, 5555555555, +15555555555
export const phoneSchema = z.string().regex(
  /^(\+1\s?)?((\(\d{3}\))|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}$/,
  'Enter a valid US phone number'
);

export const businessProfileSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  phone: phoneSchema,
  category: z.string().min(1, 'Category is required'),
  website: z.union([z.string().url(), z.literal('')]).optional(),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
