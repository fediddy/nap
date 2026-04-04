import type { FastifyInstance } from 'fastify';
import Papa from 'papaparse';
import { importRowSchema } from '@nap/shared';
import { db } from '../db/connection.js';
import { businesses, batches } from '../db/schema.js';

// Capitalize first letter of each dot-separated path segment for better error messages
function formatFieldPath(path: string): string {
  return path
    .split('.')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('.');
}

interface PreviewRow {
  row: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateOf?: { id: string; name: string };
  isUpdate?: boolean;
  changedFields?: Array<{ field: string; oldValue: string; newValue: string }>;
}

type ExistingBusiness = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  category: string;
  website: string | null;
};

function detectChangedFields(
  row: Record<string, string>,
  existing: ExistingBusiness
): Array<{ field: string; oldValue: string; newValue: string }> {
  const fields: Array<keyof typeof existing> = ['name', 'address', 'city', 'state', 'zip', 'phone', 'category', 'website'];
  const changed: Array<{ field: string; oldValue: string; newValue: string }> = [];
  for (const field of fields) {
    const newValue = (row[field] ?? '').trim();
    const oldValue = (existing[field] ?? '').toString().trim();
    if (newValue !== oldValue) {
      changed.push({ field, oldValue, newValue });
    }
  }
  return changed;
}

export default async function importRoutes(fastify: FastifyInstance) {
  fastify.post('/businesses/import', async (request, reply) => {
    const body = request.body as {
      csv?: string;
      rows?: Array<Record<string, string>>;
      filename?: string;
      importValidOnly?: boolean;
      skipDuplicates?: boolean;
    };

    // Support either raw CSV string or pre-parsed rows array (for inline-edited data)
    let rawRows: Array<Record<string, string>>;

    if (body.rows && Array.isArray(body.rows)) {
      // Pre-parsed rows from inline editing — skip PapaParse
      rawRows = body.rows;
    } else if (body.csv) {
      // Parse CSV
      const parsed = Papa.parse<Record<string, string>>(body.csv, {
        header: true,
        skipEmptyLines: true,
      });

      // Check required headers
      const requiredHeaders = ['name', 'address', 'city', 'state', 'zip', 'phone', 'category'];
      const presentHeaders = parsed.meta.fields ?? [];
      const missingHeaders = requiredHeaders.filter((h) => !presentHeaders.includes(h));

      if (missingHeaders.length > 0) {
        return reply.status(400).send({
          error: true,
          code: 'INVALID_FORMAT',
          message: `Missing required column${missingHeaders.length > 1 ? 's' : ''}: ${missingHeaders.join(', ')}`,
        });
      }

      rawRows = parsed.data;
    } else {
      return reply.status(400).send({ error: true, code: 'MISSING_CSV', message: 'CSV content or rows are required' });
    }

    // Validate each row
    const validRows: Array<{ rowIndex: number; data: Record<string, string> }> = [];
    const previewRows: Array<PreviewRow> = [];

    rawRows.forEach((row, idx) => {
      const result = importRowSchema.safeParse({
        name: row.name,
        address: row.address,
        city: row.city,
        state: row.state,
        zip: row.zip,
        phone: row.phone,
        category: row.category,
        website: row.website || '',
      });

      if (result.success) {
        validRows.push({ rowIndex: idx, data: row });
        previewRows.push({
          row: idx + 2, // 1-indexed + header row
          data: row,
          valid: true,
          errors: [],
          isDuplicate: false,
        });
      } else {
        previewRows.push({
          row: idx + 2,
          data: row,
          valid: false,
          errors: result.error.errors.map((e) => `${formatFieldPath(e.path.join('.'))}: ${e.message}`),
          isDuplicate: false,
        });
      }
    });

    // Duplicate detection — fetch all businesses once, match in memory
    const allExisting = await db.select({
      id: businesses.id,
      name: businesses.name,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zip: businesses.zip,
      phone: businesses.phone,
      category: businesses.category,
      website: businesses.website,
    }).from(businesses);

    // Build a lookup map keyed by lowercased name+city+state
    const existingMap = new Map<string, ExistingBusiness>();
    for (const biz of allExisting) {
      const key = `${biz.name.toLowerCase()}|${biz.city.toLowerCase()}|${biz.state.toLowerCase()}`;
      existingMap.set(key, biz);
    }

    // Annotate preview rows with duplicate info
    for (const previewRow of previewRows) {
      const key = `${(previewRow.data.name ?? '').toLowerCase()}|${(previewRow.data.city ?? '').toLowerCase()}|${(previewRow.data.state ?? '').toLowerCase()}`;
      const match = existingMap.get(key);
      if (match) {
        previewRow.isDuplicate = true;
        previewRow.duplicateOf = { id: match.id, name: match.name };
        const changed = detectChangedFields(previewRow.data, match);
        previewRow.isUpdate = changed.length > 0;
        previewRow.changedFields = changed;
      }
    }

    const importValidOnly = body.importValidOnly === true;
    const skipDuplicates = body.skipDuplicates !== false; // default true

    const invalidCount = previewRows.filter((r) => !r.valid).length;
    const validCount = previewRows.filter((r) => r.valid).length;

    // If there are invalid rows and we're not in importValidOnly mode — return preview
    if (invalidCount > 0 && !importValidOnly) {
      return reply.status(422).send({
        error: false, // not an error — it's a preview response
        code: 'VALIDATION_PREVIEW',
        message: `${invalidCount} row${invalidCount > 1 ? 's' : ''} failed validation`,
        data: {
          validCount,
          invalidRows: previewRows
            .filter((r) => !r.valid)
            .map((r) => ({ row: r.row, errors: r.errors })),
          preview: previewRows,
        },
      });
    }

    // Determine rows to import
    let rowsToInsert = validRows;

    if (skipDuplicates) {
      rowsToInsert = rowsToInsert.filter((vr) => {
        const previewRow = previewRows.find((pr) => pr.row === vr.rowIndex + 2);
        return !previewRow?.isDuplicate;
      });
    }

    if (rowsToInsert.length === 0) {
      return reply.status(400).send({ error: true, code: 'NO_VALID_ROWS', message: 'No valid rows to import' });
    }

    // Insert businesses in a transaction
    const filename = body.filename ?? 'upload.csv';

    const [batch] = await db.transaction(async (tx) => {
      const inserted = await tx.insert(businesses).values(
        rowsToInsert.map((vr) => ({
          name: vr.data.name,
          address: vr.data.address,
          city: vr.data.city,
          state: vr.data.state,
          zip: vr.data.zip,
          phone: vr.data.phone,
          category: vr.data.category,
          website: vr.data.website || null,
          status: 'active' as const,
        }))
      ).returning({ id: businesses.id });

      const [newBatch] = await tx.insert(batches).values({
        csvFilename: filename,
        businessCount: inserted.length,
        status: 'imported',
      }).returning();

      return [newBatch];
    });

    return reply.status(201).send({
      data: {
        batchId: batch.id,
        imported: rowsToInsert.length,
        skipped: invalidCount + (validRows.length - rowsToInsert.length),
      },
      meta: {},
    });
  });
}
