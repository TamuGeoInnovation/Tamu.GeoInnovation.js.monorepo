import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * Choosing a result in All Maps' search opens that map (#1868).
 *
 * `retired.spec.ts` checks what the search lists. Nothing checked that a result could be chosen, and
 * with the mouse it could not: pressing a result took focus out of the search box, the list closed on
 * that focus change, and the click landed on the page behind it. The box kept the typed text, so the
 * page looked as if it had simply not reacted. The keyboard path (arrow down, Enter) worked throughout,
 * and is checked too so a fix for one cannot break the other.
 *
 * Read-only, so it runs against any environment and on the schedule.
 */

/**
 * The featured parking map: every environment lists it, and the All Maps button leads to the same route.
 * The map then adds its own path (`/map/d`), so the check is that the address starts with this one.
 */
const TERM = 'Campus Main Parking';
const ROUTE = '/parking/ts-main-parking';

/** Opens All Maps, types the term and waits for its result, returning the result's row. */
async function search(page: Page) {
  await blockAnalytics(page);
  await page.goto('/all-maps');

  const input = page.locator('tamu-gisc-autocomplete input').first();
  await input.click({ timeout: 60_000 });
  await input.pressSequentially(TERM, { delay: 20 });

  const result = page.locator('tamu-gisc-autocomplete .autocomplete-item', { hasText: TERM }).first();
  await expect(result, `searching "${TERM}" on All Maps did not list it`).toBeVisible({ timeout: 30_000 });

  return { input, result };
}

test.describe('All Maps search', () => {
  test('choosing a result with the mouse opens that map', async ({ page }) => {
    const { result } = await search(page);

    await result.click();

    await expect(page, `choosing "${TERM}" with the mouse left the page on All Maps`).toHaveURL(
      (url) => url.pathname.startsWith(ROUTE),
      { timeout: 30_000 }
    );
  });

  test('choosing a result with the keyboard opens that map', async ({ page }) => {
    const { input } = await search(page);

    await input.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page, `choosing "${TERM}" with the keyboard left the page on All Maps`).toHaveURL(
      (url) => url.pathname.startsWith(ROUTE),
      { timeout: 30_000 }
    );
  });
});
