import { expect, Page, test } from '@playwright/test';
import * as fs from 'fs';

import { APP_ROOT, MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';

/**
 * A satellite campus map opened directly shows none of College Station's notifications (#1265, #1281).
 *
 * The Ring Day, Football, Kickoff at Kyle and 150th notices are College Station's and belong on its
 * maps only. #1266 scoped them by route, but a campus map loaded as the first page still showed them
 * for its first moment, because the shell read the route before the router had finished navigating.
 * They then dismissed themselves after ten seconds, which is why a later look found nothing - and why
 * this watches from the moment the page loads rather than checking once.
 *
 * Found by `popup.spec.ts`, whose click on the DC building landed on the Football notice instead. That
 * caught it on one campus and by accident; this checks every campus the environment lists, on purpose.
 *
 * The All Maps pages are checked the same way: notices belong on a page showing a map, not over a list
 * of maps (#1290).
 */

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/** The satellite campus maps this environment lists. */
const campusMaps = manifest.maps.filter((path) => path.startsWith('/campus/'));

/** Any notification on screen, single or grouped. */
const NOTIFICATIONS = 'tamu-gisc-notification-item, tamu-gisc-notification-grouped .grouped-item';

/**
 * How long to watch. Notices are raised as the application starts and dismiss themselves after ten
 * seconds, so twelve covers their whole life.
 */
const WATCH_MS = 12_000;

/** The All Maps pages: listings of maps, which show no notices of anyone's. */
const ALL_MAPS_PAGES = [
  '/all-maps',
  '/all-maps/campus',
  '/all-maps/parking',
  '/all-maps/campus-events',
  '/all-maps/athletics-events',
  '/all-maps/operations',
  '/all-maps/150'
];

/** Opens a page directly and returns the first line of every notification seen while watching it. */
async function noticesSeenOn(page: Page, path: string): Promise<string[]> {
  await blockAnalytics(page);

  const response = await page.goto(path);

  expect(response?.status(), `${path} did not return 200`).toBe(200);
  await expect(page.locator(APP_ROOT)).not.toBeEmpty();

  const seen: string[] = [];
  const until = Date.now() + WATCH_MS;

  while (Date.now() < until) {
    for (const text of await page.locator(NOTIFICATIONS).allInnerTexts()) {
      const line = text.trim().split('\n')[0];

      if (line && !seen.includes(line)) {
        seen.push(line);
      }
    }

    await page.waitForTimeout(250);
  }

  return seen;
}

test.describe('satellite campus notifications', () => {
  test('the environment lists some campus maps to check', () => {
    // Without this, a discovery change that stops listing them would empty this file and still be
    // reported as green.
    expect(campusMaps.length, 'no /campus/ maps were discovered, so nothing below ran').toBeGreaterThan(0);
  });

  for (const mapPath of campusMaps) {
    test(`${mapPath} opened directly shows no College Station notifications`, async ({ page }) => {
      const seen = await noticesSeenOn(page, mapPath);

      expect(seen, `${mapPath} showed notifications that belong to College Station's maps`).toEqual([]);
    });
  }
});

test.describe('All Maps notifications', () => {
  for (const path of ALL_MAPS_PAGES) {
    test(`${path} shows no notifications`, async ({ page }) => {
      const seen = await noticesSeenOn(page, path);

      expect(seen, `${path} lists maps and should show no notifications, but showed these`).toEqual([]);
    });
  }
});

/**
 * Notices raised on the main map are taken down on leaving it for All Maps (#1307).
 *
 * #1292 stopped them being raised on the All Maps pages, but ones already on screen stayed there until
 * they timed out: land on the map, click All Maps within ten seconds, and they covered the list.
 */
test.describe('leaving a map', () => {
  test('notices on the main map are gone after clicking through to All Maps', async ({ page }) => {
    await blockAnalytics(page);
    await page.goto('/map');
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();

    const notices = page.locator(NOTIFICATIONS);

    try {
      await notices.first().waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      // No College Station event is close enough to raise one today, so there is nothing to carry over.
      test.skip(true, 'no notices are raised on the main map today');
    }

    await page.getByRole('link', { name: /all maps/i }).first().click();
    await page.waitForURL(/\/all-maps/);
    await page.waitForTimeout(1_000);

    expect(await notices.allInnerTexts(), 'notices from the main map are still showing over All Maps').toEqual([]);
  });
});
