import { test, expect } from '@playwright/test';
const BASE = 'https://aggiemap.tamu.edu/';

test.describe('Sidebar Settings', () => {
  test('Settings/Options/Filters area is visible on load (smoke)', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const settings = page.getByText(/^\s*Settings\s*$/i).first();
    const options  = page.getByText(/^\s*Options\s*$/i).first();
    const filters  = page.getByText(/^\s*Filters\s*$/i).first();

    if (!(await settings.count()) && !(await options.count()) && !(await filters.count())) {
      const toolbarButtons = [
        page.getByRole('button', { name: /Menu|Options|Filters|Settings|More/i }).first(),
        page.locator('[aria-label*="menu" i],[aria-label*="options" i],[aria-label*="filters" i],[aria-label*="settings" i]').first(),
        page.locator('header button,[class*="toolbar" i] button,[class*="top" i] button').first(),
      ];
      for (const btn of toolbarButtons) {
        if (await btn.count()) { await btn.click().catch(()=>{}); await page.waitForTimeout(300); }
      }
    }

    const visible = async (loc: any) => (await loc.count?.()) && await loc.isVisible().catch(() => false);
    const anyVisible = await visible(settings) || await visible(options) || await visible(filters);
    expect(anyVisible).toBeTruthy();
  });
});
