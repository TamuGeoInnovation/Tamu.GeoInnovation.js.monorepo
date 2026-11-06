import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import {
  DEVELOPMENT_ONLY_CONTROLS,
  DEVELOPMENT_ONLY_ALL_MAPS_TILES,
  DEVELOPMENT_ONLY_SECTIONS,
  DEVELOPMENT_ONLY_SERVICES,
  developmentSectionsVisible,
  sidebarTabs
} from './development-only';
import { isDevelopmentUrl, smokeBaseUrl } from './gis-hosts';

/**
 * Development-only sections stay off production (#1090).
 *
 * Checked both ways from `developmentSectionsVisible` in environments.json, so the gate is proven to
 * hide them where it should and to keep them where it should. A check that only ran on production
 * would pass just as well if the section had been deleted outright.
 */

const VISIBLE = developmentSectionsVisible();
/** Whether this environment reads the development GIS server, which localhost does not (#2001). */
const DEVELOPMENT_GIS = isDevelopmentUrl(smokeBaseUrl());
const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** Whether the map on the page reports it has loaded. */
async function probeReady(page: Page): Promise<boolean> {
  return page.evaluate(
    (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
    PROBE_GLOBAL
  );
}

test.describe(`development-only sections ${VISIBLE ? 'are offered here' : 'stay off this environment'}`, () => {
  for (const section of DEVELOPMENT_ONLY_SECTIONS) {
    test(`the ${section} tab ${VISIBLE ? 'is offered' : 'is not offered'}`, async ({ page }) => {
      await blockAnalytics(page);
      await page.goto('/map');

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

      const count = await sidebarTabs(page, section);

      expect(
        count,
        VISIBLE
          ? `the ${section} tab should be offered here`
          : `the ${section} tab is offered on an environment that should not have it`
      ).toBe(VISIBLE ? 1 : 0);
    });
  }
});

/**
 * Development-only tiles in the All Maps "Visit Maps" row stay off production (#912).
 *
 * Checked on `/all-maps`, and on a map-type page as well, because the row is rendered by
 * `MapsPageHeaderComponent` on every Maps page now: a gate can hold on the page it was written for
 * and still leak on the one that borrowed the component.
 */
test.describe(`development-only All Maps tiles ${VISIBLE ? 'are offered here' : 'stay off this environment'}`, () => {
  for (const route of ['/all-maps', '/all-maps/parking']) {
    for (const label of DEVELOPMENT_ONLY_ALL_MAPS_TILES) {
      test(`${route}: the ${label} tile ${VISIBLE ? 'is offered' : 'is not offered'}`, async ({ page }) => {
        await blockAnalytics(page);
        await page.goto(route);

        const row = page.locator('.visit-maps-row');
        await expect(row, `the Visit Maps row should be rendered on ${route}`).toBeVisible();

        const tile = row.locator('.visit-maps-tile', { hasText: label });

        expect(
          await tile.count(),
          VISIBLE
            ? `the ${label} tile should be offered on ${route} here`
            : `the ${label} tile is offered on ${route} on an environment that should not have it`
        ).toBe(VISIBLE ? 1 : 0);
      });
    }
  }
});

/**
 * Development-only GIS services are requested only where development-only sections show (#1229).
 *
 * Every page a service lists in `DEVELOPMENT_ONLY_SERVICES` is loaded and every request recorded. On
 * development each page must request every service that lists it; a service one map alone uses is not
 * required of the others (#1460). On production no page may request any of them.
 */
test.describe(`development-only services ${VISIBLE ? 'are used here' : 'are never requested here'}`, () => {
  const pages = [...new Set(Object.values(DEVELOPMENT_ONLY_SERVICES).flatMap((service) => service.pages))];

  // A permanent map built on the event framework, reachable without a builder choice. The campus
  // basemap reaches an event map only for a visitor who has saved Aggieland as their basemap.
  const SAVED_BASEMAP_PAGE = '/parking/visitor-parking';

  for (const path of pages) {
    test(`${path} ${VISIBLE ? 'requests the ones it uses' : 'requests none of them'}`, async ({ page }) => {
      const requested: string[] = [];

      page.on('request', (request) => requested.push(request.url()));
      await blockAnalytics(page);

      if (path === SAVED_BASEMAP_PAGE) {
        await page.addInitScript(() =>
          window.localStorage.setItem('user-preferences', JSON.stringify({ settings: { basemap: 'aggie_basemap' } }))
        );
      }

      // On production a development-only map's link redirects to the main map, which is then the page
      // that must request none of them.
      await page.goto(path);

      for (const [service, { reason, pages: usedOn, developmentGisServer }] of Object.entries(
        DEVELOPMENT_ONLY_SERVICES
      )) {
        if (VISIBLE && !usedOn.includes(path)) {
          continue;
        }

        const hits = () => requested.filter((url) => url.includes(service));

        if (VISIBLE && (!developmentGisServer || DEVELOPMENT_GIS)) {
          // Waits for the request rather than for the map: whether the map then draws is another test's
          // question, and this one only needs to see that the service is reachable from here.
          await expect
            .poll(() => hits().length, { message: `${service} (${reason}) should be in use here`, timeout: 90_000 })
            .toBeGreaterThan(0);
        } else {
          // Only a loaded map has asked for everything it is going to - but a request to the service is
          // already the answer, and a map drawing a basemap it cannot display may never load at all.
          await expect
            .poll(async () => hits().length > 0 || (await probeReady(page)), {
              message: 'the map never finished loading',
              timeout: 90_000,
              intervals: [1_000]
            })
            .toBe(true);
          expect(hits(), `${service} (${reason}) has no production service, but was requested here`).toEqual([]);
        }
      }
    });
  }
});

/**
 * Development-only controls drawn on the map stay off production (#1541).
 *
 * The Aerial Imagery date slider is gated on `TestingService.isTesting`, like the Bus Routes tab, and
 * like that tab nothing asserted the gate worked - which is how Bus Routes reached production in the
 * first place (#1090). It is not a sidebar tab and it requests no service of its own, so neither of
 * the lists above covers it.
 *
 * Each control is reached by the address that brings it up, and checked both ways: offered where
 * development sections are, absent where they are not. One direction alone would pass just as well if
 * the control had been deleted outright, or if the page had simply failed to load.
 */
test.describe(`development-only map controls ${VISIBLE ? 'are offered here' : 'stay off this environment'}`, () => {
  for (const control of DEVELOPMENT_ONLY_CONTROLS) {
    test(`${control.name} ${VISIBLE ? 'is offered' : 'is not offered'}`, async ({ page }) => {
      await blockAnalytics(page);
      await page.goto(control.page);

      const locator = page.locator(control.selector);

      if (VISIBLE) {
        // Not waiting for the map first: the control is drawn as soon as the captures are read, which
        // is well before the imagery has finished painting.
        await expect(locator, `${control.name} should be offered here (${control.reason})`).toBeVisible({
          timeout: 120_000
        });

        return;
      }

      // Only a map that has finished loading has drawn everything it is going to, so a page that
      // never got that far cannot pass this by being empty.
      await expect
        .poll(async () => probeReady(page), {
          message: `${control.page} never finished loading, so its absence proves nothing`,
          timeout: 120_000,
          intervals: [1_000]
        })
        .toBe(true);

      await expect(locator, `${control.name} must not reach production (${control.reason})`).toHaveCount(0);
    });
  }
});


/**
 * `?as=production` makes a development host behave as production, for the tab (#1722).
 *
 * Checked on the main map's development-only tabs, which the tests above have already shown to be
 * offered on a development host and absent on production. The switch must take them away on a
 * development host, say that it has, last when the address no longer carries it, and give them back
 * on `?as=development`. On production it must do nothing either way: it can turn development
 * behaviour off and never on.
 */
test.describe('acting as production', () => {
  /** Shown while the switch is on, with the way back. */
  const BANNER = 'tamu-gisc-acting-as-production .acting-as-production--on';
  /** Shown on every page of a development host while it is off: one click turns it on. */
  const OFFER = 'tamu-gisc-acting-as-production .acting-as-production--offer';

  async function mainMap(page: Page, query = ''): Promise<void> {
    await page.goto(`/map${query}`);

    await expect
      .poll(async () => probeReady(page), {
        message: `/map${query} never finished loading`,
        timeout: 120_000,
        intervals: [1_000]
      })
      .toBe(true);
  }

  async function tabsOffered(page: Page): Promise<number[]> {
    return Promise.all(DEVELOPMENT_ONLY_SECTIONS.map((section) => sidebarTabs(page, section)));
  }

  /** The All Maps page's way in: a section only a development host shows. */
  const ALL_MAPS_LINK = 'a[href="/all-maps?as=production"]';

  async function allMaps(page: Page): Promise<void> {
    await page.goto('/all-maps');
    await expect(page.locator('h1.maps-page-title'), '/all-maps never drew its title').toBeVisible({ timeout: 90_000 });
  }

  const none = DEVELOPMENT_ONLY_SECTIONS.map(() => 0);
  const all = DEVELOPMENT_ONLY_SECTIONS.map(() => 1);

  if (VISIBLE) {
    test('?as=production takes the development sections away until ?as=development', async ({ page }) => {
      test.setTimeout(420_000);
      await blockAnalytics(page);

      // Acting as production reaches the GIS server too: nothing may be asked of the development one.
      const developmentGisRequests: string[] = [];
      page.on('request', (request) => {
        if (new URL(request.url()).hostname.startsWith('gis-dev.')) {
          developmentGisRequests.push(request.url());
        }
      });

      await mainMap(page, '?as=production');
      expect(await tabsOffered(page), 'development sections are still offered with ?as=production').toEqual(none);
      expect(developmentGisRequests, 'the development GIS server was asked while acting as production').toEqual([]);
      await expect(page.locator(BANNER), 'nothing on the page says it is acting as production').toBeVisible();

      // Moving between maps drops query parameters, so the switch has to outlast the address.
      await mainMap(page);
      expect(await tabsOffered(page), 'the switch was lost when the address no longer carried it').toEqual(none);
      await expect(page.locator(BANNER)).toBeVisible();

      await mainMap(page, '?as=development');
      expect(await tabsOffered(page), 'development sections did not come back with ?as=development').toEqual(all);
      await expect(page.locator(BANNER)).toHaveCount(0);

      // And from the map itself, without typing an address: the offer is on every page.
      await page.locator(OFFER).click();
      await expect(page.locator(BANNER), 'the offer on the map did not turn the switch on').toBeVisible({
        timeout: 90_000
      });
      expect(new URL(page.url()).pathname, 'the offer left the page it was on').toMatch(/^\/map/);
    });
    test('All Maps offers the switch, and following it turns it on', async ({ page }) => {
      test.setTimeout(300_000);
      await blockAnalytics(page);

      await allMaps(page);
      await expect(page.locator(ALL_MAPS_LINK), 'All Maps does not offer View as Production here').toBeVisible();

      await page.locator(ALL_MAPS_LINK).click();
      await expect(page.locator(BANNER), 'following the link did not turn the switch on').toBeVisible({ timeout: 90_000 });
      // Hidden with every other development feature while the switch is on; the banner is the way back.
      await expect(page.locator(ALL_MAPS_LINK)).toHaveCount(0);

      await page.locator(`${BANNER} a`).click();
      await expect(page.locator(ALL_MAPS_LINK), 'Back to dev did not bring the development sections back').toBeVisible({
        timeout: 90_000
      });
      await expect(page.locator(BANNER)).toHaveCount(0);
    });
  } else {
    test('All Maps does not offer the switch here', async ({ page }) => {
      await blockAnalytics(page);

      await allMaps(page);
      await expect(page.locator(ALL_MAPS_LINK), 'View as Production must not be offered on production').toHaveCount(0);
    });

    test('neither ?as=development nor ?as=production changes anything here', async ({ page }) => {
      test.setTimeout(300_000);
      await blockAnalytics(page);

      await mainMap(page, '?as=development');
      expect(await tabsOffered(page), '?as=development turned development sections on').toEqual(none);

      await mainMap(page, '?as=production');
      expect(await tabsOffered(page)).toEqual(none);
      await expect(page.locator(BANNER), 'the acting-as-production banner must not show here').toHaveCount(0);
      await expect(page.locator(OFFER), 'View as production must not be offered on production').toHaveCount(0);
    });
  }
});
