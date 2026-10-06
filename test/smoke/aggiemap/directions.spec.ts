import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import { directionsAvailable, directionsEntryPoints } from './directions';

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
