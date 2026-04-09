import type { BusinessProfile, SubmissionResult, RemovalResult } from '@nap/shared';
import type { DirectoryAdapter } from './base.adapter.js';
import { getOrCreateProfile, saveProfile } from '../browser/profile.js';
import { createBrowserContext, humanType } from '../browser/engine.js';
import { restoreSession } from '../browser/session.js';

export class FacebookBusinessAdapter implements DirectoryAdapter {
  readonly slug = 'facebook';
  readonly displayName = 'Facebook Business';
  readonly type = 'browser' as const;

  async submit(business: BusinessProfile): Promise<SubmissionResult> {
    const profile = await getOrCreateProfile(business.id, 'facebook-business');
    const context = await createBrowserContext(profile);

    try {
      if (profile.cookiesJson && profile.cookiesJson.length > 0) {
        await restoreSession(context, profile.cookiesJson);
      }

      const page = await context.page();
      await page.goto('https://www.facebook.com/pages/create', { waitUntil: 'domcontentloaded', timeout: 30000 });

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        return {
          status: 'requires_action',
          message: 'Login required — navigate to /session-relay/facebook-business to authenticate',
        };
      }

      // Fill business name
      await humanType(page, 'input[name="name"], input[placeholder*="name" i], input[aria-label*="name" i]', business.name);

      // Fill category
      const categoryInput = await page.$('input[placeholder*="categor" i], input[aria-label*="categor" i]');
      if (categoryInput) {
        await humanType(page, 'input[placeholder*="categor" i], input[aria-label*="categor" i]', business.category);
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }

      // Submit the form
      await page.click('button[type="submit"], div[role="button"][aria-label*="create" i]');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });

      const newUrl = page.url();
      const pageIdMatch = newUrl.match(/\/(\d+)\/?$/);
      const pageId = pageIdMatch ? pageIdMatch[1] : newUrl;

      // Persist session cookies
      const updatedCookiesJson = await context.exportCookies();
      profile.cookiesJson = updatedCookiesJson;
      await saveProfile(profile);

      return {
        status: 'submitted',
        externalId: pageId,
        message: 'Page created',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        status: 'failed',
        errorCode: 'NAVIGATION_ERROR',
        message,
      };
    } finally {
      await context.close();
    }
  }

  async update(_business: BusinessProfile, _externalId: string): Promise<SubmissionResult> {
    return {
      status: 'requires_action',
      message: 'Manual update required in Facebook Business Manager',
    };
  }

  async remove(_externalId: string): Promise<RemovalResult> {
    return {
      status: 'not_found',
      message: 'Manual removal required in Facebook Business Manager',
    };
  }

  async checkHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('https://www.facebook.com/robots.txt', { signal: controller.signal });
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('abort') || message.includes('timeout')) {
        return 'degraded';
      }
      return 'down';
    } finally {
      clearTimeout(timer);
    }
  }
}
