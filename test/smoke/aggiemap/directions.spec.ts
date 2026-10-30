import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { directionsAvailable, directionsEntryPoints } from './directions';
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';
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

const POPUP_CASES: PopupCase[] = [
  { name: 'building', path: '/map?bldg=0468', shows: /Sterling C\. Evans Library/ },
  { name: 'parking lot', path: '/map?lot=100b', shows: /Lot 100b/i },
  { name: 'point of interest', path: '/map?poi=1', shows: /Bonfire Memorial/ },
  { name: 'bus stop', path: '/map?busstop=4719', shows: /Blinn/ },
  { name: 'event map feature', path: '/parking/avp-parking/map?feature=AVP-parking-lots:26135', shows: /Lot 043/ }
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
 * The trip planner itself is offered at its address only where directions are.
 *
 * Its markup was commented out in March 2026 (#683) for a "routing services are undergoing maintenance"
 * message on every host. It is back on development hosts, so its components can be tested, and the
 * message stays everywhere else. The tab is hidden on production (the checks above), but the address
 * still opens the panel, and a shared link is how a visitor would reach it. Checked both ways, and on a
 * development host also with `?as=production` (#1722), which must hide it as production does.
 */
test.describe(`the trip planner ${AVAILABLE ? 'is offered' : 'is not offered'} at its address`, () => {
  const PLANNER = 'tamu-gisc-sidebar-trip-planner';
  const STOPS = `${PLANNER} tamu-gisc-search input`;
  const MAINTENANCE = `${PLANNER} .maintenance-message`;

  async function expectHidden(page: Page, address: string): Promise<void> {
    await openMap(page, address);

    await expect(page.locator(MAINTENANCE), `${address} does not say routing is unavailable`).toBeVisible();
    await expect(page.locator(STOPS), `${address} offers the trip planner's from and to boxes`).toHaveCount(0);
  }

  if (AVAILABLE) {
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
      await expect(page.locator(MAINTENANCE), '/map/d/trip still shows the maintenance message').toHaveCount(0);
    });

    test('/map/d/trip?as=production shows the maintenance message instead', async ({ page }) => {
      await expectHidden(page, '/map/d/trip?as=production');
    });
  } else {
    test('/map/d/trip shows the maintenance message instead of the from and to boxes', async ({ page }) => {
      await expectHidden(page, '/map/d/trip');
    });
  }
});

/**
 * The development routing network solves what the trip planner offers on it (#659).
 *
 * The planner reads the network's travel modes from the network and finds each of its own by name, so a list that
 * changes cannot send a trip to the wrong mode. What this adds is the alarm: the modes the planner offers are exactly
 * the ones below, so when Transportation adds Drive_ADA, or drops Bus, this fails and a person decides what the picker
 * should say. Where directions are hidden nothing connects to the network, so nothing is asked of it.
 */
const OFFERED_ON_DEVELOPMENT_NETWORK = [1, 2, 3, 5, 7, 8];

if (AVAILABLE) {
  test.describe('the development routing network', () => {
    const route = `${Connections('gis-dev.it.tamu.edu').developmentRoutingBaseUrl}/Map/NAServer/Route`;

    test('lists the travel modes the planner offers, and only those', async ({ request }) => {
      const response = await request.get(`${route}?f=json`, { timeout: 30_000 });
      const { supportedTravelModes } = (await response.json()) as { supportedTravelModes: Array<{ name: string }> };

      expect(supportedTravelModes?.length, `${route} lists no travel modes`).toBeGreaterThan(0);

      const offered = Object.keys(NETWORK_TRAVEL_MODE_NAMES)
        .map(Number)
        .filter((mode) => offeredTravelMode(supportedTravelModes, mode));

      expect(
        offered,
        `the network lists ${supportedTravelModes.map((m) => m.name).join(', ')}; the trip planner would offer these modes`
      ).toEqual(OFFERED_ON_DEVELOPMENT_NETWORK);
    });

    test('solves a route between two campus points in every mode it lists', async ({ request }) => {
      const modes = ((await (await request.get(`${route}?f=json`, { timeout: 30_000 })).json()) as {
        supportedTravelModes: Array<{ name: string }>;
      }).supportedTravelModes;

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