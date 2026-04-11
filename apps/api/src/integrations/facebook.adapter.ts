import type { BusinessProfile, SubmissionResult, RemovalResult } from '@nap/shared';
import type { DirectoryAdapter } from './base.adapter.js';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { directoryAccounts } from '../db/schema.js';
import { createBrowserContext, humanType } from '../browser/engine.js';
import { restoreSession } from '../browser/session.js';

export class FacebookBusinessAdapter implements DirectoryAdapter {
  readonly slug = 'facebook';
  readonly displayName = 'Facebook Business';
  readonly type = 'browser' as const;

  async submit(business: BusinessProfile): Promise<SubmissionResult> {
    // Pick least-recently-used active Facebook account
    const [account] = await db
      .select()
      .from(directoryAccounts)
      .where(and(eq(directoryAccounts.slug, 'facebook'), eq(directoryAccounts.status, 'active')))
      .orderBy(sql`last_used_at ASC NULLS FIRST`)
      .limit(1);

    if (!account) {
      return {
        status: 'requires_action',
        message: 'No active Facebook account — POST cookies to /api/session-relay/facebook',
      };
    }

    // Build a NAPBrowserProfile-compatible object from the account
    const profile = {
      businessId: account.id,
      directorySlug: 'facebook',
      userAgent:
        account.userAgent ??
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
      viewport: { width: 1440, height: 900 },
      locale: 'en-US',
      timezone: 'America/New_York',
      cookiesJson: account.cookiesJson ?? '',
      createdAt: account.createdAt.toISOString(),
    };

    const context = await createBrowserContext(profile);

    try {
      if (account.cookiesJson) {
        await restoreSession(context, account.cookiesJson);
      }

      const page = await context.page();
      await page.goto('https://www.facebook.com/pages/create', { waitUntil: 'domcontentloaded', timeout: 30000 });

      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        // Mark account as needing reauth
        await db.update(directoryAccounts)
          .set({ status: 'needs_reauth', updatedAt: new Date() })
          .where(eq(directoryAccounts.id, account.id));

        return {
          status: 'requires_action',
          message: `Facebook account "${account.label}" needs re-authentication — POST new cookies to /api/session-relay/facebook`,
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

      // Save updated cookies + increment pages_created
      const updatedCookiesJson = await context.exportCookies();
      await db.update(directoryAccounts)
        .set({
          cookiesJson: updatedCookiesJson,
          pagesCreated: sql`pages_created + 1`,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(directoryAccounts.id, account.id));

      return {
        status: 'submitted',
        externalId: pageId,
        message: `Page created via account "${account.label}"`,
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
