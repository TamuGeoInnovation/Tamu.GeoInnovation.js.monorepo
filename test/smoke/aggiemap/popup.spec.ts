import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { expect, HEAVY, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { waitForSettledFraming } from './framing';

/**
 * Clicking a feature on a map opens its popup, and the popup shows that feature's data (#1117).
 *
 * The rest of the smoke suite checks that layers load and return features. That cannot notice a
 * map where clicking does nothing. On the satellite-campus maps the buildings are drawn by a
 * vector-tile basemap, which `view.hitTest()` cannot reach, so a nearly transparent feature layer
 * sits on top purely so that a click opens a popup (see `dc-bush-school.definitions.ts`). If that
 * overlay's service, fields or popup change, as its service did in #1110, clicks silently stop
 * working while every layer still loads.
 *
 * Read-only, and needs no screenshots, so it runs against any environment and on the schedule.
 *
 * Add a map by adding a row, not code. A map whose popup is known to be broken is listed in
 * `environments.json`'s `allowedPopupFailures`, tied to its issue: its check still runs, records the
 * failure, and says so when it starts passing (#657, #2520).
 */

interface PopupCase {
  /** Map to open. */
  mapPath: string;
  /**
   * Where to click: as fractions of the map view's width and height (`{ x: 0.5, y: 0.5 }` is the view's
   * centre, which is the map's configured centre before anything pans it), or at a longitude and latitude,
   * for a feature that is not at the centre. The second needs a view in Web Mercator or WGS84, as every
   * event map opens on (#657).
   */
  clickAt: { x: number; y: number } | { longitude: number; latitude: number };
  /** What the click should hit, for failure messages. */
  feature: string;
  /** Text the popup must contain, proving it shows that feature's data. */
  popupShows: RegExp;
}

const POPUP_CASES: PopupCase[] = [
  // The map is centred on the building, so the view's centre is on it.
  {
    mapPath: '/campus/dc-bush-school',
    clickAt: { x: 0.5, y: 0.5 },
    feature: 'the Bush School building',
    popupShows: /Bush School - DC/
  },
  // Lot 100g, in both maps' opening view. Each popup shows that map's own note for the lot, which the
  // generic parking-lot popup underneath does not (#657).
  {
    mapPath: '/events/nsc-parking',
    clickAt: { longitude: -96.34475, latitude: 30.60516 },
    feature: 'Lot 100g',
    popupShows: /Register for a permit/
  },
  {
    mapPath: '/events/break-summer',
    clickAt: { longitude: -96.34475, latitude: 30.60516 },
    feature: 'Lot 100g',
    popupShows: /For Break Parking/
  }
];

const BASE_URL = process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu';

/** Maps whose popup is known to be broken here, by map path, each tied to an issue. From environments.json. */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, { baseUrl: string; allowedPopupFailures?: Record<string, string> }> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const normalised = BASE_URL.replace(/\/$/, '');
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === normalised);

  return match?.allowedPopupFailures ?? {};
}

const ALLOWED = allowedFailures();

/** The point on the map view to click for a case, relative to the view's top-left corner. */
async function clickPoint(page: Page, clickAt: PopupCase['clickAt'], width: number, height: number) {
  if ('x' in clickAt) {
    return { x: width * clickAt.x, y: height * clickAt.y };
  }

  // A point in the view's own spatial reference, made from its centre so `toScreen` accepts it.
  return await page.evaluate(({ longitude, latitude }) => {
    const view = (document.querySelector('arcgis-map') as unknown as { view: __esri.MapView }).view;
    const point = view.center.clone();

    point.longitude = longitude;
    point.latitude = latitude;

    const screen = view.toScreen(point);

    return { x: screen?.x ?? -1, y: screen?.y ?? -1 };
  }, clickAt);
}

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Opens a map and waits until its layers have loaded and it has finished drawing. */
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

  // A click before the view has drawn can land on nothing, which would read as a broken popup.
  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { drawing?: boolean }>)[name]?.drawing === false,
          PROBE_GLOBAL
        ),
      { message: `the map on ${mapPath} never finished drawing`, timeout: 60_000, intervals: [1_000] }
    )
    .toBe(true);
}

test.describe('popup', () => {
  for (const { mapPath, clickAt, feature, popupShows } of POPUP_CASES) {
    test(`${mapPath}: clicking ${feature} opens its popup with data`, async ({ page }) => {
      await openMap(page, mapPath);

      const view = page.locator('.esri-view-surface').first();
      const box = await view.boundingBox();

      expect(box, `${mapPath} has no map view to click`).not.toBeNull();

      const at = await clickPoint(page, clickAt, box!.width, box!.height);

      await page.mouse.click(box!.x + at.x, box!.y + at.y);

      const popup = page.locator('tamu-gisc-feature-popup .popup');
      const known = ALLOWED[mapPath];
      let problem: string | null = null;

      try {
        await expect(popup, `clicking ${feature} on ${mapPath} did not open a popup`).not.toHaveClass(/hidden/, {
          timeout: 15_000
        });
        await expect(popup, `the popup for ${feature} on ${mapPath} did not show its data`).toContainText(popupShows);
      } catch (error) {
        if (known === undefined) {
          throw error;
        }

        problem = (error as Error).message.split('\n')[0];
      }

      if (known !== undefined) {
        test.info().annotations.push({
          type: problem ? 'known failure' : 'known failure now passing',
          description: problem
            ? `${mapPath}: ${problem} (${known})`
            : `${mapPath}'s popup shows its data again; remove it from allowedPopupFailures (${known})`
        });
      }
    });
  }

  /**
   * With a popup open, clicking another feature shows that feature's details, not the first's (#1672).
   *
   * The popup stays on the page and is handed the next feature. A popup that stops repainting when it
   * is, which is how OnPush fails on a component whose data arrives outside its inputs (#1669), keeps
   * showing the feature it opened on while every check of a single popup passes.
   *
   * A link to a building opens with its popup, zoomed to that building, so its neighbours are always in
   * the same place on screen: Harrington to its left and Peterson below to the right, at the suite's
   * viewport. If the link's framing changes, the first click names the building it expected.
   */
  test(`/map/d?bldg=0468: clicking one building after another shows each one's popup in turn`, HEAVY, async ({ page }) => {
    test.setTimeout(180_000);

    const mapPath = '/map/d?bldg=0468';
    const popup = page.locator('tamu-gisc-feature-popup .popup');
    const clicks: Array<{ clickAt: { x: number; y: number }; shows: RegExp; feature: string }> = [
      { clickAt: { x: 0.117, y: 0.375 }, shows: /Harrington Education Center/, feature: 'Harrington' },
      { clickAt: { x: 0.602, y: 0.819 }, shows: /Peterson Building/, feature: 'Peterson' }
    ];

    await openMap(page, mapPath);
    await expect(popup, `${mapPath} did not open with its building's popup`).toContainText(/Sterling C\. Evans Library/);
    // The link zooms to its building after the map has drawn; the neighbours are where they are said to be once it stops.
    await waitForSettledFraming(page, mapPath);

    const box = await page.locator('.esri-view-surface').first().boundingBox();

    expect(box, `${mapPath} has no map view to click`).not.toBeNull();

    let showing = /Sterling C\. Evans Library/;

    for (const { clickAt, shows, feature } of clicks) {
      await page.mouse.click(box!.x + box!.width * clickAt.x, box!.y + box!.height * clickAt.y);

      await expect(popup, `clicking ${feature} on ${mapPath} did not show its popup`).toContainText(shows, {
        timeout: 15_000
      });
      await expect(
        popup,
        `clicking ${feature} on ${mapPath} left the previous feature's details in its popup`
      ).not.toContainText(showing);

      showing = shows;
    }
  });
});
