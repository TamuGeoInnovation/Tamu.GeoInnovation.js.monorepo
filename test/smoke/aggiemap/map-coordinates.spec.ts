import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { directionsAvailable } from './directions';
import { readGraphicTypes, waitForSettledFraming } from './framing';

/**
 * The main map in 2D answers a click with its latitude and longitude, and the keyboard viewfinder lists
 * the buildings under it (#1875).
 *
 * On dev the main map's 2D basemap is in Texas Centric (wkid 32139), and Esri gives a point's latitude
 * and longitude only in a geographic or Web Mercator reference. The click coordinates called `toFixed`
 * on a null latitude, so every click logged a TypeError and showed nothing, and the viewfinder queried
 * the buildings with a polygon made of nulls, which found none. In 3D, in Web Mercator, both worked, and
 * every layer loaded and drew, so nothing else in the suite noticed.
 *
 * A click in directions sets a stop where it lands, from the same latitude and longitude: on dev it threw
 * on the null latitude and set no stop.
 */

const MAP = '/map/d';
const DIRECTIONS = '/map/d/trip';

/** The layer the trip planner draws its stops in. */
const TRIP_POINTS_LAYER = 'trip-points-layer';

/** Opens the main map, waits until it has settled, and collects the script errors it logs from then on. */
async function openMainMap(page: Page, path = MAP): Promise<string[]> {
  await blockAnalytics(page);
  await page.goto(path);
  await waitForSettledFraming(page, path);

  const errors: string[] = [];

  // Only errors about coordinates are kept: the dev GIS server's missing layers, and directions on a host
  // with no routing service, log errors of their own that are not this. Angular reports an error thrown
  // in a handler as a console error, not a page error, so both are read.
  const about = /toFixed|latitude|longitude/;

  page.on('pageerror', (error) => about.test(error.message) && errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && about.test(message.text()) && errors.push(message.text()));

  return errors;
}

/** Clicks the map view at a fraction of its width and height: the middle unless told otherwise. */
async function clickMap(page: Page, at = { x: 0.5, y: 0.5 }): Promise<void> {
  const box = await page.locator('.esri-view-surface').first().boundingBox();

  expect(box, `${MAP} has no map view to click`).not.toBeNull();

  await page.mouse.click(box!.x + box!.width * at.x, box!.y + box!.height * at.y);
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

  test('a click on the map in directions sets a stop where it lands', async ({ page }) => {
    test.skip(!directionsAvailable(), 'directions are not offered in this environment');
    test.setTimeout(180_000);

    const errors = await openMainMap(page, DIRECTIONS);

    // Simpson Drill Field, a lawn: on a building the stop takes the building's name, and a stop with no
    // building is named by its latitude and longitude, which is what threw. Routing need not answer: the
    // stop is drawn as soon as it is set, before any route is asked for.
    await clickMap(page, { x: 0.55, y: 0.465 });

    await expect
      .poll(async () => Object.values(await readGraphicTypes(page, TRIP_POINTS_LAYER)).reduce((a, b) => a + b, 0), {
        message: `a click on ${DIRECTIONS} drew no stop`,
        // Each reading is a whole probe snapshot, which counts every layer's features and takes seconds.
        timeout: 60_000
      })
      .toBe(1);
    expect(errors, 'a click in directions logged an error about its coordinates').toEqual([]);
  });
});
