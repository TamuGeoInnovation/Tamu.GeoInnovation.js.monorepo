import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';
import {
  DEVELOPMENT_ONLY_SECTIONS,
  DEVELOPMENT_ONLY_SERVICES,
  developmentSectionsVisible,
  sidebarTabs
} from './development-only';

/**
 * Development-only sections stay off production (#1090).
 *
 * Checked both ways from `developmentSectionsVisible` in environments.json, so the gate is proven to
 * hide them where it should and to keep them where it should. A check that only ran on production
 * would pass just as well if the section had been deleted outright.
 */

const VISIBLE = developmentSectionsVisible();
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

      for (const [service, { reason, pages: usedOn }] of Object.entries(DEVELOPMENT_ONLY_SERVICES)) {
        if (VISIBLE && !usedOn.includes(path)) {
          continue;
        }

        const hits = () => requested.filter((url) => url.includes(service));

        if (VISIBLE) {
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
