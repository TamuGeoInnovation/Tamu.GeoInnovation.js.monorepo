import { expect, test } from '@playwright/test';
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

test.describe('satellite campus notifications', () => {
  test('the environment lists some campus maps to check', () => {
    // Without this, a discovery change that stops listing them would empty this file and still be
    // reported as green.
    expect(campusMaps.length, 'no /campus/ maps were discovered, so nothing below ran').toBeGreaterThan(0);
  });

  for (const mapPath of campusMaps) {
    test(`${mapPath} opened directly shows no College Station notifications`, async ({ page }) => {
      await blockAnalytics(page);

      const response = await page.goto(mapPath);

      expect(response?.status(), `${mapPath} did not return 200`).toBe(200);
      await expect(page.locator(APP_ROOT)).not.toBeEmpty();

      const seen: string[] = [];
      const until = Date.now() + WATCH_MS;

      while (Date.now() < until) {
        const texts = await page.locator(NOTIFICATIONS).allInnerTexts();

        for (const text of texts) {
          const line = text.trim().split('\n')[0];

          if (line && !seen.includes(line)) {
            seen.push(line);
          }
        }

        await page.waitForTimeout(250);
      }

      expect(seen, `${mapPath} showed notifications that belong to College Station's maps`).toEqual([]);
    });
  }
});
