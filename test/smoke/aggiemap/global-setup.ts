import { chromium, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { blockAnalytics } from './analytics';
import { retiredMaps } from './retired';
import { describeQuickSet, quickSetFor } from './scope';
import { gisHostFor, smokeBaseUrl } from './gis-hosts';
// connections.ts loads without the Angular dependency graph (see services.spec.ts).
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

/**
 * Discovers every map the target environment lists, and writes it to a manifest the spec reads at
 * collection time so one test can be generated per map.
 *
 * ---
 *
 * Why discover at runtime instead of importing the definitions
 *
 * `EventDefinitions` is the obvious source, and it does not work: importing it pulls the Angular
 * dependency graph into the Playwright process, which fails first on the JIT compiler and then on
 * bundler-only module resolution (`lightgallery/angular/13`). Loading half an Angular application
 * to list some URLs is the wrong shape for a smoke process anyway.
 *
 * Crawling has a real advantage besides. The two environments legitimately list different maps --
 * production does not show the kiosk section, a map can be marked `visible: false`, and a retired map
 * (`status: 'retired'`, #1098) is filtered out below -- so a crawl gives each environment the right
 * set automatically, where a committed list would need per-environment exceptions. The satellite
 * campus maps were in that list until #1482 listed them on production too, which is the kind of
 * change a crawl absorbs and a committed list would not.
 *
 * The cost is that a map which disappears from the discovery pages is silently not tested, rather
 * than failing. `maps.spec.ts` guards that with a coverage floor.
 */

/**
 * A map's route. `/map/d/<panel>` is the main map opened on one of its panels and listed as a map of its own, such as
 * the bus map, `/map/d/bus` (#2743).
 */
const MAP_ROUTE = /^\/((events|parking|transportation|operations|campus|kiosk)\/|map\/d\/[a-z-]+$)/;

/**
 * Whether a listed map is the main map opened on one of its panels, such as the bus map, `/map/d/bus` (#2743). Its layers
 * are the main map's, which the specs that check layers check once, at `/map`; the panel itself shows something else.
 */
export function isMainMapPanel(mapPath: string): boolean {
  return /^\/map\/d\/[a-z-]+$/.test(mapPath);
}

/** The discovery pages are reached from All Maps; the main map is not listed on it. */
const ALL_MAPS = '/all-maps';
const MAIN_MAP = '/map';

/**
 * AggieMap's root element. App-specific -- GIS Day uses `tamu-gisc-root`, and borrowing that here
 * silently matched nothing.
 */
export const APP_ROOT = 'tamu-gisc-aggiemap-app-root';

export interface MapManifest {
  baseUrl: string;
  discoveredAt: string;
  /** Root-relative paths, each one a map to test. Always includes the main map. */
  maps: string[];
  /**
   * The bus routes the main map's bus panel lists, by route code, so `bus.spec.ts` can generate a test
   * per route (#1473). Empty where bus routes are not offered; `null` if the panel could not be read.
   */
  busRoutes: string[] | null;
  /**
   * A bus stop to open by `?busstop=`, by its id in this environment's bus service: Blinn, the 15th stop of route 47.
   * Found here rather than written into the specs, because each environment's service numbers its stops differently
   * (#2636). `null` if the service did not answer with exactly one such stop.
   */
  busStop: number | null;
}

/** The main map's bus panel, and what it renders: a route per bus, or a notice where none are offered. */
export const BUS_PANEL = '/map/d/bus';
export const BUS_ROUTE = 'tamu-gisc-bus-route';
export const BUS_NOTICE = '.bus-routes-notice';

export const MANIFEST_PATH = path.join(__dirname, 'map-manifest.generated.json');

export default async function globalSetup(): Promise<void> {
  if (process.env.AGGIEMAP_SMOKE_TIER === 'quick') {
    // Once per run, before anything loads: what the quick tier chose and what it could not map.
    console.log(describeQuickSet(quickSetFor((process.env.AGGIEMAP_SMOKE_CHANGED ?? '').split(',').filter(Boolean))));
  }

  const baseUrl = smokeBaseUrl();

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const internalLinks = async (): Promise<string[]> =>
      await page.$$eval('a[href]', (anchors) =>
        anchors
          .map((a) => a.getAttribute('href'))
          .filter((href): href is string => typeof href === 'string' && href.startsWith('/'))
      );

    /**
     * Navigates and waits for the links themselves to exist.
     *
     * `waitUntil: 'networkidle'` is not enough and quietly discovered nothing against a dev server:
     * it makes fewer requests than production, so the network goes idle *before* Angular has
     * rendered, and the crawl read an empty page. Waiting on a selector that only exists once the
     * list is rendered works on both.
     */
    const gotoAndWaitForLinks = async (pagePath: string, linkSelector: string, required: boolean): Promise<void> => {
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'domcontentloaded' });

      try {
        await page.waitForSelector(linkSelector, { timeout: 60_000 });
      } catch (error) {
        if (required) {
          throw new Error(
            `${pagePath} never rendered any links matching '${linkSelector}', so no maps could be ` +
              `discovered on ${baseUrl}. The environment is either down or its discovery pages are broken.`
          );
        }
      }
    };

    await gotoAndWaitForLinks(ALL_MAPS, `a[href^="${ALL_MAPS}/"]`, true);

    const topLevel = [...new Set(await internalLinks())];
    const maps = new Set<string>([MAIN_MAP, ...topLevel.filter((href) => MAP_ROUTE.test(href))]);

    // The section tiles on All Maps lead to detail pages (`/all-maps/parking` and friends), and the
    // individual maps are listed there rather than on All Maps itself.
    const detailPages = topLevel.filter((href) => href.startsWith(`${ALL_MAPS}/`));

    for (const detailPage of detailPages) {
      // Not required: a section can legitimately be empty in an environment, and that should reduce
      // this environment's discovered set rather than fail discovery outright. The coverage floor in
      // `maps.spec.ts` catches the case where too many come back empty.
      await gotoAndWaitForLinks(
        detailPage,
        'a[href^="/events/"], a[href^="/parking/"], a[href^="/transportation/"], a[href^="/operations/"], a[href^="/campus/"], a[href^="/kiosk/"], a[href^="/map/d/"]',
        false
      );

      for (const href of await internalLinks()) {
        if (MAP_ROUTE.test(href)) {
          maps.add(href);
        }
      }
    }

    // Dev's All Events list keeps retired maps on purpose, so the crawl finds them there. They are
    // over and their services are often stopped, so they are not tested (#1098).
    const retiredIds = retiredMaps().map((map) => map.id);
    const isRetired = (href: string) => retiredIds.includes(href.split(/[/?#]/)[2]);
    const skipped = [...maps].filter(isRetired);

    const busRoutes = await discoverBusRoutes(page, baseUrl);
    const busStop = await discoverBusStop(page, baseUrl);

    const manifest: MapManifest = {
      baseUrl,
      discoveredAt: new Date().toISOString(),
      maps: [...maps].filter((href) => !isRetired(href)).sort(),
      busRoutes,
      busStop
    };

    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

    console.log(
      `[smoke] discovered ${manifest.maps.length} maps on ${baseUrl}` +
        (skipped.length > 0 ? `; skipped ${skipped.length} retired: ${skipped.join(', ')}` : '') +
        (busRoutes === null ? '; could not read the bus panel' : `; ${busRoutes.length} bus routes`) +
        (busStop === null ? '; could not find the bus stop to link to' : `; bus stop ${busStop}`)
    );
  } finally {
    await browser.close();
  }
}

/**
 * Blinn's id, the 15th stop of route 47, in the bus service this environment reads. Asked of the service by what the
 * stop is, because its id is not the same on every environment: development's view numbers its stops from 1 and
 * production's from 4214, and a republished view numbers them again (#2636). Not required, as the bus panel is not.
 */
async function discoverBusStop(page: Page, baseUrl: string): Promise<number | null> {
  const where = "stopname = 'Blinn' AND route = '47' AND stopnum = 15";
  const url = `${Connections(gisHostFor(baseUrl)).busRoutesUrl}/0/query?f=json&outFields=objectid&returnGeometry=false&where=${encodeURIComponent(where)}`;

  try {
    const answer = await (await page.request.get(url)).json();
    const ids: unknown[] = (answer.features ?? []).map(
      (feature: { attributes?: { objectid?: unknown } }) => feature.attributes?.objectid
    );

    return ids.length === 1 && typeof ids[0] === 'number' ? ids[0] : null;
  } catch {
    return null;
  }
}

/**
 * The route codes the bus panel lists, read from the panel itself rather than the bus service, so the
 * tests check the routes a visitor is offered (the panel decides that, per environment).
 *
 * Not required, as a discovery page is not: `null` when the panel never rendered, and `bus.spec.ts`
 * then fails with that. The list is read once it has stopped growing, so a list rendered in pieces is
 * not read half-drawn.
 */
async function discoverBusRoutes(page: Page, baseUrl: string): Promise<string[] | null> {
  await blockAnalytics(page);
  await page.goto(`${baseUrl}${BUS_PANEL}`, { waitUntil: 'domcontentloaded' });

  const numbers = page.locator(`${BUS_ROUTE} .route-number`);

  try {
    await numbers.first().or(page.locator(BUS_NOTICE)).waitFor({ timeout: 60_000 });
  } catch {
    return null;
  }

  let count = await numbers.count();

  // Up to 15 s for it to hold still for a second.
  for (let unchangedFor = 0, waited = 0; unchangedFor < 1_000 && waited < 15_000; waited += 250) {
    await page.waitForTimeout(250);
    const next = await numbers.count();
    unchangedFor = next === count ? unchangedFor + 250 : 0;
    count = next;
  }

  return [...new Set((await numbers.allInnerTexts()).map((code) => code.trim()))];
}
