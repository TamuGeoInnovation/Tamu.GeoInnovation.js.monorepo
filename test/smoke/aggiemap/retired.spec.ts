import { expect, Page, test } from '@playwright/test';

import { retiredMaps } from './retired';

/**
 * Retired maps are offered nowhere (#1098).
 *
 * An event that is over is marked `status: 'retired'`: its definition stays, so a link already
 * shared still resolves, but search and the listing pages do not offer it, on any environment. Dev is
 * the case that matters, since its search also shows hidden maps and `visible: false` alone kept
 * retired maps in it.
 *
 * The one exception is dev's All Events list, which keeps every event, working or not: it is where
 * the team finds a map that no longer works. That is checked too, so the exception cannot quietly
 * become "retired maps vanish from dev".
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

/** Dev's list of every event, retired ones included. Links inside it are not "offering" a map. */
const ALL_EVENTS = '.all-events-section';

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

      const hrefs = await mapLinks.evaluateAll(
        (anchors, allEvents) => anchors.filter((a) => !a.closest(allEvents)).map((a) => a.getAttribute('href') ?? ''),
        ALL_EVENTS
      );
      const offending = RETIRED.filter((map) => hrefs.some((href) => linksTo(href, map.id))).map(
        (map) => `${map.name} (${map.file})`
      );

      expect(offending, `${listing} links retired maps`).toEqual([]);
    });
  }

  test("dev's All Events list keeps every retired map, labelled Retired", async ({ page }) => {
    await page.goto('/all-maps');

    const items = page.locator(`${ALL_EVENTS} li`);
    const present = await items
      .first()
      .waitFor({ timeout: 30_000 })
      .then(() => true)
      .catch(() => false);

    // All Events is development-only, so production has nothing to check.
    test.skip(!present, 'no All Events list on this environment (it is development-only)');

    const entries = await items.evaluateAll((lis) =>
      lis.map((li) => ({
        href: li.querySelector('a')?.getAttribute('href') ?? '',
        retiredLabel: Array.from(li.querySelectorAll('.retired-label')).some(
          (el) => el.textContent?.trim().toLowerCase() === 'retired'
        )
      }))
    );

    for (const map of RETIRED) {
      const entry = entries.find((e) => linksTo(e.href, map.id));

      expect.soft(entry, `All Events should keep ${map.name} (${map.file}); it is where the team finds it`).toBeDefined();
      expect.soft(entry?.retiredLabel, `${map.name} should carry a Retired label in All Events`).toBe(true);
    }

    const labelledCurrent = entries
      .filter((e) => e.retiredLabel && !RETIRED.some((map) => linksTo(e.href, map.id)))
      .map((e) => e.href);

    expect.soft(labelledCurrent, 'only retired maps carry the Retired label').toEqual([]);
  });

  for (const map of RETIRED) {
    for (const suffix of ['', '/map']) {
      test(`${map.route}${suffix} shows that the event has ended, not a map`, async ({ page }) => {
        await page.goto(`${map.route}${suffix}`);

        await expect(page, 'a retired map should land on its ended page').toHaveURL(new RegExp(`${map.route}/ended$`), {
          timeout: 30_000
        });
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(`${map.name} has ended`);
        await expect(page.getByRole('link', { name: /all maps/i }).last()).toBeVisible();

        // Not a map: no map view, and the map probe never appears.
        await expect(page.locator('.esri-view-surface')).toHaveCount(0);
        expect(await page.evaluate(() => '__tamuGiscMapProbe' in window), 'the map probe loaded, so a map started').toBe(
          false
        );
      });
    }
  }
});
