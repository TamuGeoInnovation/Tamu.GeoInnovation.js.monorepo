import { expect, Page, test } from '@playwright/test';

import { retiredMaps } from './retired';

/**
 * Retired maps are offered nowhere (#1098).
 *
 * An event that is over is marked `status: 'retired'`: its definition stays, so a link already
 * shared still resolves, but no list and no search offers it, on any environment. Dev is the case
 * that matters. There, search and the development-only All Events list also show hidden maps, and
 * `visible: false` alone kept retired maps in both.
 *
 * The unit test on DiscoveryService covers the list every page is built from. This covers what a
 * visitor actually sees, so a page that someday builds its own list is caught too.
 */

const RETIRED = retiredMaps();

/** All Maps and every page it links to that lists maps. */
const LISTING_PAGES = [
  '/all-maps',
  '/all-maps/150',
  '/all-maps/parking',
  '/all-maps/athletics-events',
  '/all-maps/campus-events',
  '/all-maps/operations'
];

/** A current map every environment lists, so an empty search cannot pass by finding nothing at all. */
const CURRENT = 'Kickoff at Kyle';

/** Map routes are /<section>/<id>, optionally followed by more path or a query string. */
function linksTo(href: string, id: string): boolean {
  return new RegExp(`^/[a-z-]+/${id}(?:[/?#]|$)`).test(href);
}

async function searchResults(page: Page, term: string): Promise<string[]> {
  const input = page.locator('tamu-gisc-autocomplete input').first();

  await input.fill('');
  await input.pressSequentially(term, { delay: 20 });

  const names = page.locator('tamu-gisc-autocomplete .app-name');

  // Results update as the filter runs, so read until two reads in a row agree. An absence can only
  // be asserted on a list that has stopped changing.
  let previous: string | undefined;

  for (let attempt = 0; attempt < 20; attempt++) {
    await page.waitForTimeout(400);
    const current = (await names.allInnerTexts()).map((name) => name.trim()).join('|');

    if (current === previous) {
      return current === '' ? [] : current.split('|');
    }

    previous = current;
  }

  throw new Error(`search results for "${term}" never settled`);
}

test.describe('retired maps', () => {
  test('the definitions mark at least one map retired', () => {
    // Guards the text parsing: if it stops finding the marker, every test below would pass by
    // checking nothing.
    expect(RETIRED.map((map) => map.id).length, 'no retired maps were read from the definitions').toBeGreaterThan(0);
  });

  test('search does not offer a retired map', async ({ page }) => {
    await page.goto('/all-maps');

    const current = await searchResults(page, CURRENT);
    expect(current, `searching "${CURRENT}" should find it, or this test proves nothing`).toContain(CURRENT);

    for (const map of RETIRED) {
      for (const term of [map.name, map.id]) {
        const results = await searchResults(page, term);

        // Soft, so one run names every retired map that search offers, not only the first.
        expect.soft(results, `searching "${term}" offered ${map.name} (${map.file})`).not.toContain(map.name);
      }
    }
  });

  for (const listing of LISTING_PAGES) {
    test(`${listing} does not link a retired map`, async ({ page }) => {
      await page.goto(listing);

      const mapLinks = page.locator('a[href^="/events/"], a[href^="/parking/"], a[href^="/operations/"]');
      await expect(mapLinks.first(), `${listing} rendered no map links, so there was nothing to check`).toBeAttached({
        timeout: 60_000
      });

      const hrefs = await mapLinks.evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href') ?? ''));
      const offending = RETIRED.filter((map) => hrefs.some((href) => linksTo(href, map.id))).map(
        (map) => `${map.name} (${map.file})`
      );

      expect(offending, `${listing} links retired maps`).toEqual([]);
    });
  }
});
