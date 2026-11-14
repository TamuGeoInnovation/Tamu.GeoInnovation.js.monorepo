import { APIRequestContext, Page } from '@playwright/test';
import * as fs from 'fs';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { directionsAvailable, directionsEntryPoints } from './directions';
import { MANIFEST_PATH, MapManifest } from './global-setup';
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';
import { gisHostFor, smokeBaseUrl } from './gis-hosts';
import {
  NETWORK_TRAVEL_MODE_NAMES,
  offeredTravelMode
} from '../../../libs/maps/feature/trip-planner/src/lib/services/trip-planner-travel-modes';

/**
 * No "Directions To Here" is left anywhere while routing is unavailable (#1003).
 *
 * Routing is unpublished, so directions are development-only: on production the Directions tab and
 * every "Directions To Here" button are hidden, and on dev and localhost they stay for whoever rebuilds
 * routing. environments.json says which applies (`directionsAvailable`), and each case below checks it
 * both ways, so the gate is proven to hide them where it should and to keep them where it should.
 *
 * The popups are the ones a visitor reaches by link, one per kind of popup that offers directions,
 * plus an event map's. Every map's sidebar is checked by maps.spec.ts, which loads them all anyway,
 * and every popup template is checked for the gate by a unit test in the popups library.
 */

interface PopupCase {
  /** What the popup is. */
  name: string;
  /** Opens it. */
  path: string;
  /** Text the popup must show, proving it opened with data before its buttons are judged. */
  shows: RegExp;
}

/**
 * Blinn, the bus stop opened by `?busstop=`, by its id in this environment's bus service, which global setup asks the
 * service for: the ids are not the same on every environment (#2636). `not-found` makes the test fail saying so.
 */
const BUS_STOP = (JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) as MapManifest).busStop ?? 'not-found';

const POPUP_CASES: PopupCase[] = [
  { name: 'building', path: '/map?bldg=0468', shows: /Sterling C\. Evans Library/ },
  { name: 'parking lot', path: '/map?lot=100b', shows: /Lot 100b/i },
  { name: 'point of interest', path: '/map?poi=1', shows: /Bonfire Memorial/ },
  { name: 'bus stop', path: `/map?busstop=${BUS_STOP}`, shows: /Blinn/ },
  { name: 'event map feature', path: '/parking/avp-parking/map?feature=AVP-parking-lots:26135', shows: /Lot 043/ },
  // A tent, so a visitor can walk to it on game day (#2639).
  { name: 'tailgate tent', path: '/events/tailgating/map?tent=O62', shows: /Tent O62/ }
];

const AVAILABLE = directionsAvailable();
const PROBE_GLOBAL = '__tamuGiscMapProbe';
const POPUP = 'tamu-gisc-feature-popup .popup';

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

test.describe(`directions ${AVAILABLE ? 'offered' : 'hidden'} while routing is ${
  AVAILABLE ? 'available here' : 'unavailable'
}`, () => {
  test('the main map has no Directions tab unless directions are available', async ({ page }) => {
    await openMap(page, '/map');

    const { tabs } = await directionsEntryPoints(page);

    expect(
      tabs,
      AVAILABLE ? 'the main map should offer a Directions tab here' : 'the main map still offers a Directions tab'
    ).toBe(AVAILABLE ? 1 : 0);
  });

  for (const { name, path, shows } of POPUP_CASES) {
    test(`the ${name} popup ${AVAILABLE ? 'offers' : 'does not offer'} "Directions To Here" (${path})`, async ({ page }) => {
      await openMap(page, path);

      const popup = page.locator(POPUP);
      await expect(popup, `${path} did not open its popup`).not.toHaveClass(/hidden/, { timeout: 30_000 });
      await expect(popup, `${path} did not show its data`).toContainText(shows, { timeout: 15_000 });

      const button = popup.getByText('Directions To Here', { exact: true });

      if (AVAILABLE) {
        await expect(button, `the ${name} popup should offer "Directions To Here" here`).toBeVisible();
      } else {
        await expect(button, `the ${name} popup still offers "Directions To Here"`).toHaveCount(0);
      }
    });
  }
});

/**
 * The trip planner is offered at its address, and no maintenance message is left (#2804).
 *
 * From March 2026 it showed "routing services are undergoing maintenance" in its place, everywhere but development
 * hosts (#683, #1003). With the routing network published on production it is offered on every environment; a gate
 * put back would bring the message back, which this fails on.
 */
test.describe('the trip planner is offered at its address', () => {
  const PLANNER = 'tamu-gisc-sidebar-trip-planner';
  const STOPS = `${PLANNER} tamu-gisc-search input`;

  test('/map/d/trip shows the from and to boxes', async ({ page }) => {
    await openMap(page, '/map/d/trip');

    // A trip has at least two points, so the planner starts with two empty boxes.
    await expect(page.locator(STOPS), '/map/d/trip did not show the from and to boxes').toHaveCount(2, {
      timeout: 30_000
    });
    // No stop is chosen yet, so both are empty, not the word "undefined".
    for (const box of await page.locator(STOPS).all()) {
      await expect(box, 'a from or to box is not empty before a stop is chosen').toHaveValue('');
    }
    await expect(page.locator(`${PLANNER} .maintenance-message`), '/map/d/trip still shows the maintenance message').toHaveCount(0);
  });
});

/**
 * On a phone, "Directions To Here" opens the trip planner (#2641).
 *
 * A phone shows a popup in the secondary `outlet-2`, and the button looked for `trip` inside that outlet, so a tap
 * closed the popup and stayed on the map, with `NG04002: Cannot match any routes` in the console: on every map, while
 * the same button worked on a desktop. Checked with a building on the main map and a lot on an event map.
 */
const PHONE_TRIP_CASES = [
  { name: 'a building', path: '/map?bldg=0468', trip: /\/map\/m\/trip/ },
  {
    name: 'an event map feature',
    path: '/parking/avp-parking/map?feature=AVP-parking-lots:26135',
    trip: /\/parking\/avp-parking\/map\/m\/trip/
  },
  { name: 'a tailgate tent', path: '/events/tailgating/map?tent=O62', trip: /\/events\/tailgating\/map\/m\/trip/ }
];

if (AVAILABLE) {
  test.describe('on a phone, "Directions To Here" opens the trip planner', () => {
    test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

    for (const { name, path, trip } of PHONE_TRIP_CASES) {
      test(`${name} (${path})`, async ({ page }) => {
        test.setTimeout(180_000);
        await openMap(page, path);

        const button = page.locator('tamu-gisc-feature-mobile-popup').getByText('Directions To Here', { exact: true });

        await expect(button, `${path} did not offer "Directions To Here" on a phone`).toBeVisible({ timeout: 30_000 });
        await button.click();

        await expect(page, `"Directions To Here" on ${path} did not open the trip planner on a phone`).toHaveURL(trip, {
          timeout: 30_000
        });
      });
    }
  });
}

/**
 * The development routing network solves what the trip planner offers on it (#659).
 *
 * The planner reads the network's travel modes from the network and finds each of its own by name, so a list that
 * changes cannot send a trip to the wrong mode. What this adds is the alarm: the modes the planner offers are exactly
 * the ones below, so when Transportation adds Drive_ADA, or drops Bus, this fails and a person decides what the picker
 * should say. Where directions are hidden nothing connects to the network, so nothing is asked of it.
 */
const OFFERED_ON_DEVELOPMENT_NETWORK = [1, 2, 3, 5, 7, 8];

/**
 * A route comes back, through the application, from the network the application uses (#2804).
 *
 * Not that the trip planner renders: that a route is solved. A planner whose network answers 499 Token Required, or
 * nothing, looks perfectly healthy until someone asks it for directions, and that is what production would have shown
 * had its gate come off before the network was public. So this opens the planner with two stops in its address, waits
 * for the route summary, and requires both a solve answered with a route and a distance on the page.
 *
 * Two points on roads along University Drive, as below: Drive and Bus find no route between points only walking
 * reaches, and Walking is what the planner chooses first. Latitude first, as the planner reads `?stops=`.
 */
const ROUTE_STOPS = '30.6150,-96.3500@30.6150,-96.3300';

/** The network this environment's application connects to, on its own GIS server (`routingNetworkUrl`, #2804). */
const NETWORK = Connections(gisHostFor(smokeBaseUrl())).routingNetworkUrl;

if (AVAILABLE) {
  test('the trip planner returns a route between two campus points (#2804)', async ({ page }) => {
    test.setTimeout(150_000);

    const solves: Array<{ url: string; status: number; routes: number; error?: string }> = [];

    page.on('response', async (response) => {
      if (!/\/NAServer\/Route\/solve/.test(response.url())) return;

      const body = (await response.json().catch(() => ({}))) as { error?: { message?: string }; routes?: { features?: unknown[] } };

      solves.push({
        url: response.url().split('?')[0],
        status: response.status(),
        routes: body.routes?.features?.length ?? 0,
        error: body.error?.message
      });
    });

    await blockAnalytics(page);
    await page.goto(`/map/d/trip?stops=${ROUTE_STOPS}`);

    const miles = page.locator('.directions-overview-item', { hasText: 'Miles' }).locator('.quantity');

    await expect(miles, `no route summary appeared; solves: ${JSON.stringify(solves)}`).toBeVisible({ timeout: 120_000 });
    expect(Number(await miles.textContent()), 'the route summary shows no distance').toBeGreaterThan(0);
    expect(
      solves.filter((solve) => solve.routes > 0 && solve.url.startsWith(NETWORK)),
      `no solve request to ${NETWORK} came back with a route: ${JSON.stringify(solves)}`
    ).not.toEqual([]);

    test.info().annotations.push({ type: 'route (#2804)', description: JSON.stringify(solves) });
    console.log(`[smoke] route (#2804): ${await miles.textContent()} miles; ${JSON.stringify(solves)}`);
  });

  /**
   * A trip whose two ends are both chosen from the search list solves, and is drawn on the map (#2843, #2846).
   *
   * The case above gives its stops in the address, and the popup cases only open the planner, so none of them ever
   * took the one path that moves each building to its nearest door: it runs only when every stop came from search.
   * On 11 November 2026, the day directions reached production, that path returned no route at all between Eller and
   * the Memorial Student Center (#2843), and between Eller and Halbouty it solved and listed every turn while the map
   * stayed empty (#2846). The whole of this file passed against production throughout.
   *
   * So the route has to be seen on the map, not only in the panel: a summary is what a check reads, and an empty map is
   * what the visitor got. The planner draws a route into `route-segments-layer`, which holds nothing but its lines, and
   * the map probe counts a graphics layer's graphics.
   *
   * `known` names the issue a case is red for until its fix ships, so its failure says so. They stay red, rather than
   * skipped or recorded, because a check that passes while a route is missing is the fault this exists to catch.
   */
  const SEARCHED_TRIPS = [
    {
      from: { term: 'Eller', result: /^Eller Oceanography/i },
      to: { term: 'Memorial Student Center', result: /^Memorial Student Center/i },
      known: '#2843: both ends from search find no route, because the MSC door chosen is off the network (#2845)'
    },
    {
      from: { term: 'Eller', result: /^Eller Oceanography/i },
      to: { term: 'Halbouty', result: /^Halbouty/i },
      known: '#2846: a route that solves from two searched ends is not drawn on the map'
    }
  ];

  const ROUTE_LAYER = 'route-segments-layer';
  const DROPDOWN_KNOWN = '#2844: the search list stays open after a result is chosen, covering the other box';

  for (const { from, to, known } of SEARCHED_TRIPS) {
    test(`a trip from "${from.term}" to "${to.term}", both chosen from search, shows a route on the map (${known.split(':')[0]})`, async ({
      page
    }) => {
      test.setTimeout(180_000);
      await openMap(page, '/map/d/trip');

      const boxes = page.locator('tamu-gisc-sidebar-trip-planner tamu-gisc-search');
      await expect(boxes, '/map/d/trip did not show the from and to boxes').toHaveCount(2, { timeout: 30_000 });

      for (const [index, end] of [from, to].entries()) {
        const box = boxes.nth(index);
        const input = box.locator('input');

        await input.click();
        await input.pressSequentially(end.term, { delay: 80 });

        const option = box.locator('.result-item').getByRole('option', { name: end.result });
        await expect(option.first(), `searching "${end.term}" did not list ${end.result}`).toBeVisible({ timeout: 20_000 });
        await option.first().click();

        // The list closes once a result is chosen. On 11 November it stayed open over the other box (#2844), so a
        // click on that box landed on "Current Location". Soft, so the route below is still asked about: then the
        // list is closed as a visitor would, with Escape.
        const list = box.getByRole('option');
        await expect
          .soft(list.first(), `the list stayed open after choosing "${end.term}" (known: ${DROPDOWN_KNOWN})`)
          .toBeHidden({ timeout: 5_000 });
        await page.keyboard.press('Escape');
        await expect(list.first(), `the list for "${end.term}" did not close on Escape either`).toBeHidden({
          timeout: 5_000
        });
      }

      const trip = `${from.term} to ${to.term}`;
      const miles = page.locator('.directions-overview-item', { hasText: 'Miles' }).locator('.quantity');
      const error = page.locator('#direction-feedback p.error');

      // Whichever the planner shows first: a summary, or its "No reasonable route was found!".
      await expect(miles.or(error).first(), `${trip}: the planner showed neither a route nor an error`).toBeVisible({
        timeout: 120_000
      });
      await expect(error, `${trip}: the planner found no route (known: ${known})`).toHaveCount(0);
      expect(
        Number(await miles.textContent()),
        `${trip}: the route summary shows no distance (known: ${known})`
      ).toBeGreaterThan(0);

      await expect
        .poll(
          async () =>
            await page.evaluate(
              async ({ name, layerId }) => {
                const probe = (
                  window as unknown as Record<
                    string,
                    { snapshot(): Promise<{ layers: Array<{ id: string; graphicTypes: Record<string, number> | null }> }> }
                  >
                )[name];
                const layer = (await probe.snapshot()).layers.find((candidate) => candidate.id === layerId);

                return Object.values(layer?.graphicTypes ?? {}).reduce((sum, count) => sum + count, 0);
              },
              { name: PROBE_GLOBAL, layerId: ROUTE_LAYER }
            ),
          {
            message: `${trip}: the panel shows a route of ${await miles.textContent()} miles, and ${ROUTE_LAYER} holds no route on the map (known: ${known})`,
            timeout: 30_000,
            intervals: [1_000]
          }
        )
        .toBeGreaterThan(0);
    });
  }

  test.describe("this environment's routing network", () => {
    const route = `${NETWORK}/Map/NAServer/Route`;

    /**
     * The travel modes the network lists, asked anonymously, as the application asks. The network's own error comes
     * first when it has one - `499 Token Required` while it is not public - so a failure says why, not only that.
     */
    async function travelModes(request: APIRequestContext): Promise<Array<{ name: string }>> {
      const body = (await (await request.get(`${route}?f=json`, { timeout: 30_000 })).json()) as {
        error?: { code?: number; message?: string };
        supportedTravelModes?: Array<{ name: string }>;
      };

      expect(body.error, `${route} answered ${body.error?.code} ${body.error?.message}`).toBeUndefined();
      expect(body.supportedTravelModes?.length, `${route} lists no travel modes`).toBeGreaterThan(0);

      return body.supportedTravelModes ?? [];
    }

    test('lists the travel modes the planner offers, and only those', async ({ request }) => {
      const supportedTravelModes = await travelModes(request);

      const offered = Object.keys(NETWORK_TRAVEL_MODE_NAMES)
        .map(Number)
        .filter((mode) => offeredTravelMode(supportedTravelModes, mode));

      expect(
        offered,
        `the network lists ${supportedTravelModes.map((m) => m.name).join(', ')}; the trip planner would offer these modes`
      ).toEqual(OFFERED_ON_DEVELOPMENT_NETWORK);
    });

    test('solves a route between two campus points in every mode it lists', async ({ request }) => {
      const modes = await travelModes(request);

      for (const mode of modes) {
        const answer = await request.get(`${route}/solve`, {
          timeout: 60_000,
          params: {
            f: 'json',
            // Two points on roads along University Drive, because Drive and Bus find no route between points that
            // only walking reaches (the Evans Library and the Memorial Student Center, say).
            stops: '-96.3500,30.6150;-96.3300,30.6150',
            returnDirections: 'true',
            returnRoutes: 'true',
            outSR: '4326',
            travelMode: JSON.stringify(mode)
          }
        });
        const body = (await answer.json()) as { error?: { message?: string }; routes?: { features?: unknown[] } };

        expect(body.error?.message, `${mode.name} did not solve`).toBeUndefined();
        expect(body.routes?.features?.length, `${mode.name} returned no route`).toBeGreaterThan(0);
      }
    });
  });
}