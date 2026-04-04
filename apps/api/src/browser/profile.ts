import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export interface NAPBrowserProfile {
  businessId: string;
  directorySlug: string;
  userAgent: string;
  viewport: { width: number; height: number };
  locale: string;
  timezone: string;
  cookiesJson: string;
  createdAt: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.3; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
];

const LOCALES = ['en-US', 'en-GB', 'en-CA'];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Denver',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function profilePath(businessId: string, directorySlug: string): string {
  return path.join(
    process.cwd(),
    'browser-profiles',
    `${businessId}-${directorySlug}.json`,
  );
}

export async function getOrCreateProfile(
  businessId: string,
  directorySlug: string,
): Promise<NAPBrowserProfile> {
  const filePath = profilePath(businessId, directorySlug);

  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as NAPBrowserProfile;
  } catch {
    // File does not exist — create a new profile
    const profile: NAPBrowserProfile = {
      businessId,
      directorySlug,
      userAgent: pickRandom(USER_AGENTS),
      viewport: pickRandom(VIEWPORTS),
      locale: pickRandom(LOCALES),
      timezone: pickRandom(TIMEZONES),
      cookiesJson: '',
      createdAt: new Date().toISOString(),
    };

    await saveProfile(profile);
    return profile;
  }
}

export async function saveProfile(profile: NAPBrowserProfile): Promise<void> {
  const dir = path.join(process.cwd(), 'browser-profiles');
  await mkdir(dir, { recursive: true });

  const filePath = profilePath(profile.businessId, profile.directorySlug);
  await writeFile(filePath, JSON.stringify(profile, null, 2), 'utf-8');
}
