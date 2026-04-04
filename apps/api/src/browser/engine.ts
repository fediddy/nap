import type { Page, BrowserContext } from 'playwright';
import type { NAPBrowserProfile } from './profile.js';

export interface BrowserContextWrapper {
  page(): Promise<Page>;
  close(): Promise<void>;
  exportCookies(): Promise<string>;
  importCookies(json: string): Promise<void>;
}

export async function createBrowserContext(
  profile: NAPBrowserProfile,
): Promise<BrowserContextWrapper> {
  if (process.env.DRY_RUN === 'true') {
    return createDryRunContext(profile);
  }

  const { chromium } = await import('playwright');

  const browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    userAgent: profile.userAgent,
    viewport: profile.viewport,
    locale: profile.locale,
    timezoneId: profile.timezone,
  });

  if (profile.cookiesJson && profile.cookiesJson.length > 0) {
    const cookies = JSON.parse(profile.cookiesJson);
    await context.addCookies(cookies);
  }

  const wrapper: BrowserContextWrapper = {
    async page(): Promise<Page> {
      return context.newPage();
    },

    async close(): Promise<void> {
      await context.close();
      await browser.close();
    },

    async exportCookies(): Promise<string> {
      const cookies = await context.cookies();
      return JSON.stringify(cookies);
    },

    async importCookies(json: string): Promise<void> {
      if (!json || json.length === 0) return;
      const cookies = JSON.parse(json);
      await context.addCookies(cookies);
    },
  };

  return wrapper;
}

function createDryRunContext(profile: NAPBrowserProfile): BrowserContextWrapper {
  const mockPage = new Proxy({} as Page, {
    get(_target, prop: string) {
      return async (...args: unknown[]) => {
        console.log(`[DRY_RUN] page.${prop}(${args.map((a) => JSON.stringify(a)).join(', ')})`);
      };
    },
  });

  const wrapper: BrowserContextWrapper = {
    async page(): Promise<Page> {
      console.log(`[DRY_RUN] createBrowserContext.page() for ${profile.businessId}/${profile.directorySlug}`);
      return mockPage;
    },

    async close(): Promise<void> {
      console.log(`[DRY_RUN] BrowserContextWrapper.close() for ${profile.businessId}/${profile.directorySlug}`);
    },

    async exportCookies(): Promise<string> {
      console.log(`[DRY_RUN] exportCookies() for ${profile.businessId}/${profile.directorySlug}`);
      return '[]';
    },

    async importCookies(json: string): Promise<void> {
      console.log(`[DRY_RUN] importCookies(${json}) for ${profile.businessId}/${profile.directorySlug}`);
    },
  };

  return wrapper;
}

export async function humanType(
  page: Page,
  selector: string,
  text: string,
): Promise<void> {
  await page.click(selector);

  for (let i = 0; i < text.length; i++) {
    const delay = Math.floor(Math.random() * (110 - 40 + 1)) + 40;

    // Every 20th character has a 1-in-20 chance of a typo
    if (i > 0 && i % 20 === 0 && Math.random() < 1 / 20) {
      const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      await page.keyboard.type(wrongChar, { delay });
      await page.keyboard.press('Backspace');
    }

    await page.keyboard.type(text[i], { delay });
  }
}
