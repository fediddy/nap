import type { BusinessProfile, SubmissionResult, RemovalResult } from '@nap/shared';
import type { DirectoryAdapter } from './base.adapter.js';
import { getOrCreateProfile, saveProfile } from '../browser/profile.js';
import { createBrowserContext, humanType } from '../browser/engine.js';
import { restoreSession } from '../browser/session.js';

export class YelpBusinessAdapter implements DirectoryAdapter {
  readonly slug = 'yelp';
  readonly displayName = 'Yelp Business';
  readonly type = 'browser' as const;

  async submit(business: BusinessProfile): Promise<SubmissionResult> {
    const profile = await getOrCreateProfile(business.id, 'yelp-business');
    const context = await createBrowserContext(profile);

    try {
      if (profile.cookiesJson && profile.cookiesJson.length > 0) {
        await restoreSession(context, profile.cookiesJson);
      }

      const page = await context.page();
      await page.goto('https://biz.yelp.com/claim', { waitUntil: 'domcontentloaded', timeout: 30000 });

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        return {
          status: 'requires_action',
          message: 'Login required',
        };
      }

      // Search for existing business by name + city
      const searchInput = await page.$('input[name="find_desc"], input[placeholder*="business name" i], input[aria-label*="business name" i], input[type="search"]');
      if (searchInput) {
        await humanType(page, 'input[name="find_desc"], input[placeholder*="business name" i], input[aria-label*="business name" i], input[type="search"]', business.name);
        await page.waitForTimeout(500);

        // Fill location if available
        const locationInput = await page.$('input[name="find_loc"], input[placeholder*="location" i], input[aria-label*="location" i]');
        if (locationInput) {
          await humanType(page, 'input[name="find_loc"], input[placeholder*="location" i], input[aria-label*="location" i]', `${business.city}, ${business.state}`);
        }

        // Submit the search
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {
          // Navigation may not occur if results load inline
        });
      }

      // Check if a claim button exists in results
      const claimButton = await page.$('a[href*="/claim"], button[aria-label*="claim" i], a[aria-label*="claim" i]');
      if (claimButton) {
        await claimButton.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

        // Persist session
        const updatedCookiesJson = await context.exportCookies();
        profile.cookiesJson = updatedCookiesJson;
        await saveProfile(profile);

        return {
          status: 'submitted',
          message: 'Claim initiated',
        };
      }

      // Business not found — navigate to add business form
      await page.goto('https://biz.yelp.com/signup', { waitUntil: 'domcontentloaded', timeout: 30000 });

      const addUrl = page.url();
      if (addUrl.includes('/login')) {
        return {
          status: 'requires_action',
          message: 'Login required',
        };
      }

      // Fill add-business form fields
      const nameField = await page.$('input[name="business_name"], input[placeholder*="business name" i], input[aria-label*="business name" i]');
      if (nameField) {
        await humanType(page, 'input[name="business_name"], input[placeholder*="business name" i], input[aria-label*="business name" i]', business.name);
      }

      const phoneField = await page.$('input[name="phone"], input[type="tel"]');
      if (phoneField) {
        await humanType(page, 'input[name="phone"], input[type="tel"]', business.phone);
      }

      const addressField = await page.$('input[name="address"], input[placeholder*="address" i]');
      if (addressField) {
        await humanType(page, 'input[name="address"], input[placeholder*="address" i]', business.address);
      }

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

      // Persist session
      const updatedCookiesJson = await context.exportCookies();
      profile.cookiesJson = updatedCookiesJson;
      await saveProfile(profile);

      return {
        status: 'submitted',
        message: 'Business listing submitted',
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
      message: 'Manual update required in Yelp Business Manager',
    };
  }

  async remove(_externalId: string): Promise<RemovalResult> {
    return {
      status: 'not_found',
      message: 'Manual removal required via Yelp support',
    };
  }

  async checkHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('https://biz.yelp.com/robots.txt', { signal: controller.signal });
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
