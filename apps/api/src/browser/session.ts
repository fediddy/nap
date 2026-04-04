import { readFile, writeFile } from 'fs/promises';
import type { BrowserContextWrapper } from './engine.js';

export async function persistSession(
  context: BrowserContextWrapper,
  profilePath: string,
): Promise<void> {
  const cookiesJson = await context.exportCookies();

  const raw = await readFile(profilePath, 'utf-8');
  const profile = JSON.parse(raw);
  profile.cookiesJson = cookiesJson;

  await writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
}

export async function restoreSession(
  context: BrowserContextWrapper,
  cookiesJson: string,
): Promise<void> {
  if (!cookiesJson || cookiesJson.length === 0) return;
  await context.importCookies(cookiesJson);
}

export async function relaySession(
  source: BrowserContextWrapper,
  target: BrowserContextWrapper,
): Promise<void> {
  const cookiesJson = await source.exportCookies();
  await target.importCookies(cookiesJson);
}

export async function clearSession(profilePath: string): Promise<void> {
  const raw = await readFile(profilePath, 'utf-8');
  const profile = JSON.parse(raw);
  profile.cookiesJson = '';

  await writeFile(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
}
