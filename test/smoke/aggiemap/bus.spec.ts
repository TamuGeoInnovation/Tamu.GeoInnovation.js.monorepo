import { expect, Locator, Page, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { blockAnalytics } from './analytics';

/**
 * Every bus route draws its stops, and choosing a route shows them (#1174).
 *
 * The bus panel lists a route's stops from the route's own `Stop1`..`Stop31` fields, but the map draws
 * them from the Bus Stops layer, finding the stops whose `Route` field names the route. When the two
 * disagree, a route is drawn with its stops listed in the panel and none on the map: five routes did
 * exactly that on dev (NW0104, NW0305, NW4041, 15R, 47/48), because no stop in the layer was tagged
 * with them.
 *
 * - **Every route shows its stops.** Each route the panel lists is chosen in turn, the way a visitor
 *   does it, and must draw its line and one stop marker for every stop it lists.
 * - **The interaction.** Choosing a route expands it, lists its stops and draws them; choosing it
 *   again collapses it and removes them.
 *
 * Drawn graphics are read through the map probe's `graphicTypes` for the bus routes layer: the line is
 * tagged `route` and each stop `waypoints`.
 *
 * Where bus routes are not offered (production, until `TS/Bus_Routes` is published there) the panel
 * shows a notice instead, and these tests skip. They start checking there as soon as routes appear.
 */

const BASE_URL = process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu';
const PROBE_GLOBAL = '__tamuGiscMapProbe';
const BUS_LAYER = 'bus-route-layer';

interface EnvironmentSettings {
  baseUrl: string;
  allowedBusRouteFailures?: Record<string, string>;
}

/** Routes known to fail here, by route code, each tied to an issue. From environments.json. */
function allowedFailures(): Record<string, string> {
  const environments: Record<string, EnvironmentSettings> = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')
  );
  const normalised = BASE_URL.replace(/\/$/, '');
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === normalised);

  return match?.allowedBusRouteFailures ?? {};
}

const ALLOWED = allowedFailures();

interface Drawn {
  route: number;
  waypoints: number;
}

/** What the bus routes layer has drawn right now. */
async function drawn(page: Page): Promise<Drawn> {
  const types = await page.evaluate(
    async ({ name, layerId }) => {
      const probe = (
        window as unknown as Record<
          string,
          { snapshot: () => Promise<{ layers: { id: string; graphicTypes: Record<string, number> | null }[] }> }
        >
      )[name];
      const layer = (await probe.snapshot()).layers.find((l) => l.id === layerId);

      return layer?.graphicTypes ?? {};
    },
    { name: PROBE_GLOBAL, layerId: BUS_LAYER }
  );

  return { route: types['route'] ?? 0, waypoints: types['waypoints'] ?? 0 };
}

/** Opens the bus panel and returns its routes, or skips where bus routes are not offered. */
async function openBusPanel(page: Page): Promise<Locator> {
  await blockAnalytics(page);
  await page.goto('/map/d/bus');

  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ),
      { message: 'the main map never finished loading', timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);

  // A build from before the probe reported graphics cannot show what the bus layer has drawn, and
  // would read as every route drawing nothing. Skipped rather than failed, as maps.spec.ts does for a
  // build without the probe at all: it is "deploy a newer build", not "the routes are broken".
  const reportsGraphics = await page.evaluate(async (name) => {
    const probe = (window as unknown as Record<string, { snapshot: () => Promise<{ layers: Record<string, unknown>[] }> }>)[
      name
    ];

    return (await probe.snapshot()).layers.every((layer) => 'graphicTypes' in layer);
  }, PROBE_GLOBAL);

  test.skip(!reportsGraphics, "this build's map probe predates graphicTypes, so drawn stops cannot be counted");

  const routes = page.locator('tamu-gisc-bus-route');
  const notice = page.locator('.bus-routes-notice');

  await expect(routes.first().or(notice)).toBeVisible({ timeout: 60_000 });
  test.skip(await notice.isVisible(), 'bus routes are not offered on this environment yet');

  return routes;
}

/** Chooses a route and waits until its stops are listed and its line is drawn. */
async function choose(page: Page, route: Locator): Promise<string[]> {
  await route.locator('.route-overview').click();

  const listed = route.locator('.stops-list li');
  await expect(listed.first(), 'choosing the route did not list its stops').toBeVisible({ timeout: 30_000 });
  await expect
    .poll(async () => (await drawn(page)).route, { message: 'choosing the route did not draw it', timeout: 30_000 })
    .toBeGreaterThan(0);

  return (await listed.allInnerTexts()).map((text) => text.trim());
}

/** Chooses an active route again and waits until nothing is drawn. */
async function unchoose(page: Page, route: Locator): Promise<void> {
  await route.locator('.route-overview').click();

  await expect
    .poll(async () => await drawn(page), { message: 'choosing the route again did not remove it', timeout: 30_000 })
    .toEqual({ route: 0, waypoints: 0 });
}

test.describe('bus routes', () => {
  test('choosing a route expands it, lists its stops and draws them; choosing it again removes them', async ({ page }) => {
    const routes = await openBusPanel(page);

    // A route whose stops are known to draw, so this checks the interaction rather than #1174's data.
    const route = routes.filter({ has: page.locator('.route-number', { hasText: /^\s*01\s*$/ }) });
    await expect(route, 'route 01 is not listed').toHaveCount(1);

    const stops = await choose(page, route);

    expect(stops.length, 'route 01 listed no stops').toBeGreaterThan(0);
    await expect
      .poll(async () => (await drawn(page)).waypoints, { message: "route 01's stops were not drawn", timeout: 30_000 })
      .toBeGreaterThan(0);

    await unchoose(page, route);
    await expect(route.locator('.stops-list li'), 'choosing route 01 again did not collapse it').toHaveCount(0);
  });

  test('every route draws a stop for each stop it lists', async ({ page }) => {
    // Every route is chosen in turn on one page, rather than a page per route, which would add minutes.
    test.setTimeout(15 * 60_000);

    const routes = await openBusPanel(page);
    const count = await routes.count();

    expect(count, 'the bus panel listed no routes').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const route = routes.nth(i);
      const code = (await route.locator('.route-number').innerText()).trim();
      const known = ALLOWED[code];

      await test.step(`route ${code}`, async () => {
        const stops = await choose(page, route);

        // Stops draw after the line; give them a moment before reading.
        const markers = await expect
          .poll(async () => (await drawn(page)).waypoints, { timeout: 10_000 })
          .toBe(stops.length)
          .then(() => stops.length)
          .catch(async () => (await drawn(page)).waypoints);

        const problem = markers === stops.length ? null : `lists ${stops.length} stops but draws ${markers} on the map`;

        if (known) {
          test.info().annotations.push({
            type: problem ? 'known failure' : 'known failure now passing',
            description: problem
              ? `route ${code} ${problem} (${known})`
              : `route ${code} draws all its stops again; remove it from allowedBusRouteFailures (${known})`
          });
        } else {
          expect.soft(problem, `route ${code}`).toBeNull();
        }

        await unchoose(page, route);
      });
    }
  });
});
