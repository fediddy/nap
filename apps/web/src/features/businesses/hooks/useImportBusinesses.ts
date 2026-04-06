import { useMutation } from '@tanstack/react-query';
import { API_BASE } from '../../../lib/api';

interface ImportPayload {
  csv?: string;
  rows?: Array<Record<string, string>>;
  filename: string;
  importValidOnly?: boolean;
  skipDuplicates?: boolean;
}

export interface ChangedField {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface PreviewRow {
  row: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateOf?: { id: string; name: string };
  isUpdate?: boolean;
  changedFields?: ChangedField[];
}

export interface ValidationPreview {
  validCount: number;
  invalidRows: Array<{ row: number; errors: string[] }>;
  preview: Array<PreviewRow>;
}

export interface ImportResult {
  batchId: string;
  imported: number;
  skipped: number;
}

export interface BulkUpdatePayload {
  updates: Array<{
    id: string;
    fields: Partial<{
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      category: string;
      website: string;
    }>;
  }>;
}

export interface BulkUpdateResult {
  updated: number;
  unchanged: number;
}

// Returns either ImportResult (success) or ValidationPreview (partial validation failure)
export function useImportBusinesses() {
  return useMutation({
    mutationFn: async (payload: ImportPayload): Promise<ImportResult | ValidationPreview> => {
      const res = await fetch(`${API_BASE}/api/businesses/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.status === 422 && json.code === 'VALIDATION_PREVIEW') {
        return json.data as ValidationPreview;
      }
      if (!res.ok) throw new Error(json.message ?? 'Import failed');
      return json.data as ImportResult;
    },
  });
}

export function useBulkUpdateBusinesses() {
  return useMutation({
    mutationFn: async (payload: BulkUpdatePayload): Promise<BulkUpdateResult> => {
      const res = await fetch(`${API_BASE}/api/businesses/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Bulk update failed');
      return json.data as BulkUpdateResult;
    },
  });
}
