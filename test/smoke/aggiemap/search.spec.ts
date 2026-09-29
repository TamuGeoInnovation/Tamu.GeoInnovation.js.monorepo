import { expect, Page, test } from '@playwright/test';

import { blockAnalytics } from './analytics';

/**
 * Map search returns the expected result, and choosing it shows that feature's data (#1116).
 *
 * The rest of the smoke suite checks that layers load. That cannot notice a search that stopped
 * working: on #1110 the republished DC / Bush School layer dropped the `propertyname` field its
 * search queried, so fixing only the service URLs would have brought the map back with search
 * silently broken.
 *
 * Typing uses real key events (`pressSequentially`). Setting the input's value directly does not
 * trigger the search component, which is why this could not be checked with a browser tool that
 * only sets values.
 *
 * Read-only, and needs no screenshots, so it runs against any environment and on the schedule.
 *
 * Add a map by adding a row, not code.
 */

interface SearchCase {
  /** Map to open. */
  mapPath: string;
  /** What a person would type. */
  term: string;
  /**
   * The result the list must show. The search component title-cases the display text, so the
   * comparison ignores case ("Bush School - DC (F002)" is shown as "Bush School - Dc (F002)").
   */
  result: string;
  /** Text the details popup must contain once the result is chosen, proving it shows real data. */
  popupShows: RegExp;
}

const SEARCH_CASES: SearchCase[] = [
  // Name, abbreviation and number each find the building (bldgname, bldgabbr, number).
  { mapPath: '/campus/dc-bush-school', term: 'Bush', result: 'Bush School - DC (F002)', popupShows: /Bush School - DC/ },
  { mapPath: '/campus/dc-bush-school', term: 'TAMUDC', result: 'Bush School - DC (F002)', popupShows: /1620 L St NW/ },
  { mapPath: '/campus/dc-bush-school', term: 'F002', result: 'Bush School - DC (F002)', popupShows: /Bush School - DC/ }
];

/** Maps and a term that matches nothing there: the list must stay empty, not error. */
const NO_MATCH_CASES = [{ mapPath: '/campus/dc-bush-school', term: 'Zzqx' }];

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Opens a map and waits until its layers have loaded, so search queries are not racing the map. */
async function openMap(page: Page, mapPath: string): Promise<void> {
  await blockAnalytics(page);
  await page.goto(mapPath);

  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ),
      { message: `the map on ${mapPath} never finished loading`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('search', () => {
  for (const { mapPath, term, result, popupShows } of SEARCH_CASES) {
    test(`${mapPath}: "${term}" finds "${result}" and shows its data`, async ({ page }) => {
      await openMap(page, mapPath);

      const input = page.getByPlaceholder('Find Building or Parking');
      await input.click();
      await input.pressSequentially(term, { delay: 80 });

      const results = page.locator('.search-results-container');
      const option = results.getByRole('option', { name: new RegExp(`^${escapeRegExp(result)}$`, 'i') });

      await expect(option, `searching "${term}" on ${mapPath} did not list "${result}"`).toBeVisible({
        timeout: 20_000
      });

      await option.click();

      const popup = page.locator('tamu-gisc-feature-popup .popup');

      await expect(popup, `choosing "${result}" on ${mapPath} did not open its details`).not.toHaveClass(/hidden/, {
        timeout: 15_000
      });
      await expect(popup, `the details for "${result}" on ${mapPath} did not show its data`).toContainText(popupShows);
    });
  }

  for (const { mapPath, term } of NO_MATCH_CASES) {
    test(`${mapPath}: "${term}" matches nothing and lists no results`, async ({ page }) => {
      await openMap(page, mapPath);

      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const input = page.getByPlaceholder('Find Building or Parking');
      await input.click();
      await input.pressSequentially(term, { delay: 80 });

      // Long enough for the query to return; a result arriving later would still fail below.
      await page.waitForTimeout(5_000);

      await expect(page.locator('.search-results-container').getByRole('option')).toHaveCount(0);
      expect(pageErrors, `searching "${term}" on ${mapPath} raised page errors`).toEqual([]);
    });
  }
});
