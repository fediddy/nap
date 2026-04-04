import { mkdir, appendFile, access, constants } from 'fs/promises';
import path from 'path';
import type { BusinessProfile, SubmissionResult, RemovalResult } from '@nap/shared';
import type { DirectoryAdapter } from './base.adapter.js';

function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getExportDir(): string {
  return path.join(process.cwd(), 'bing-exports');
}

function getTodayFilePath(): string {
  return path.join(getExportDir(), `${getTodayDateString()}-bing-places.csv`);
}

const CSV_HEADER = 'storeName,addressLine1,city,stateOrProvince,postalCode,countryOrRegion,phone,website,category\n';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsvRow(business: BusinessProfile): string {
  const fields = [
    business.name,
    business.address,
    business.city,
    business.state,
    business.zip,
    'US',
    business.phone,
    business.website ?? '',
    business.category,
  ];
  return fields.map(escapeCsvField).join(',') + '\n';
}

async function ensureExportDirExists(): Promise<void> {
  await mkdir(getExportDir(), { recursive: true });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function appendRowToFile(business: BusinessProfile): Promise<string> {
  await ensureExportDirExists();

  const filePath = getTodayFilePath();
  const exists = await fileExists(filePath);

  if (!exists) {
    await appendFile(filePath, CSV_HEADER, 'utf-8');
  }

  await appendFile(filePath, buildCsvRow(business), 'utf-8');

  return `bing-exports/${getTodayDateString()}-bing-places.csv`;
}

export class BingPlacesAdapter implements DirectoryAdapter {
  readonly slug = 'bing-places';
  readonly displayName = 'Bing Places';
  readonly type = 'file_export' as const;

  async submit(business: BusinessProfile): Promise<SubmissionResult> {
    const relativePath = await appendRowToFile(business);
    return {
      status: 'submitted',
      message: `Row appended to ${relativePath}`,
    };
  }

  async update(business: BusinessProfile, _externalId: string): Promise<SubmissionResult> {
    const relativePath = await appendRowToFile(business);
    return {
      status: 'submitted',
      message: `Row appended to ${relativePath}`,
    };
  }

  async remove(_externalId: string): Promise<RemovalResult> {
    return {
      status: 'not_found',
      message: 'File export type — manual removal required in Bing dashboard',
    };
  }

  async checkHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      await ensureExportDirExists();
      const testFile = path.join(getExportDir(), '.health-check');
      await appendFile(testFile, '', 'utf-8');
      return 'healthy';
    } catch {
      return 'down';
    }
  }
}
