import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { waitForSettledFraming } from './framing';

/**
 * The main map in 2D answers a click with its latitude and longitude, and the keyboard viewfinder lists
 * the buildings under it (#1875).
 *
 * On dev the main map's 2D basemap is in Texas Centric (wkid 32139), and Esri gives a point's latitude
 * and longitude only in a geographic or Web Mercator reference. The click coordinates called `toFixed`
 * on a null latitude, so every click logged a TypeError and showed nothing, and the viewfinder queried
 * the buildings with a polygon made of nulls, which found none. In 3D, in Web Mercator, both worked, and
 * every layer loaded and drew, so nothing else in the suite noticed.
 */

const MAP = '/map/d';

/** Opens the main map, waits until it has settled, and collects the script errors it logs from then on. */
async function openMainMap(page: Page): Promise<string[]> {
  await blockAnalytics(page);
  await page.goto(MAP);
  await waitForSettledFraming(page, MAP);

  const errors: string[] = [];

  // Only errors about coordinates are kept: the dev GIS server's missing layers, and directions on a host
  // with no routing service, log errors of their own that are not this. Angular reports an error thrown
  // in a handler as a console error, not a page error, so both are read.
  const about = /toFixed|latitude|longitude/;

  page.on('pageerror', (error) => about.test(error.message) && errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && about.test(message.text()) && errors.push(message.text()));

  return errors;
}

/** Clicks the middle of the map view. */
async function clickMap(page: Page): Promise<void> {
  const box = await page.locator('.esri-view-surface').first().boundingBox();

  expect(box, `${MAP} has no map view to click`).not.toBeNull();

  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

test.describe('the main map in 2D', () => {
  test('a click on the main map shows its latitude and longitude, with no error', async ({ page }) => {
    test.setTimeout(180_000);

    const errors = await openMainMap(page);

    await clickMap(page);

    const coordinates = page.locator('tamu-gisc-click-coordinates .point-coords');

    // The map opens on the middle of campus, at about 30.613, -96.345.
    await expect(coordinates, 'a click on the map showed no coordinates').toContainText(/Latitude: 30\.6\d{3}/, {
      timeout: 15_000
    });
    await expect(coordinates).toContainText(/Longitude: -96\.3\d{4}/);
    expect(errors, 'a click on the map logged an error about its coordinates').toEqual([]);
  });

  test('moving the main map with the arrow keys lists the buildings in the viewfinder', async ({ page }) => {
    test.setTimeout(180_000);

    const errors = await openMainMap(page);

    // Focused rather than clicked: the map reports a click a moment after it happens, to tell it from a
    // double click, and a click hides the viewfinder, so a key pressed straight after one is undone.
    await page.locator('.esri-view-surface').first().focus();
    await page.keyboard.press('ArrowUp');

    await expect(
      page.locator('.accessible-viewfinder-features .feature-name').first(),
      'the viewfinder listed no buildings in the middle of campus'
    ).toBeVisible({ timeout: 30_000 });
    expect(errors, 'moving the map with the keyboard logged an error about coordinates').toEqual([]);
  });
});
