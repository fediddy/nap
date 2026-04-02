export type BusinessStatus = 'active' | 'deactivated';

export interface BusinessProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  category: string;
  website: string | null;
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
}
