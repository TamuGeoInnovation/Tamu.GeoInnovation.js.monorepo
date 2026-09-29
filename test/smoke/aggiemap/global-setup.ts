import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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
 * production does not show the kiosk or satellite-campus sections, a map can be marked
 * `visible: false`, and a retired map (`status: 'retired'`, #1098) is listed nowhere -- so a crawl
 * gives each environment the right set automatically, where a
 * committed list would need per-environment exceptions.
 *
 * The cost is that a map which disappears from the discovery pages is silently not tested, rather
 * than failing. `maps.spec.ts` guards that with a coverage floor.
 */

const MAP_ROUTE = /^\/(events|parking|operations|campus|kiosk)\//;

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
}

export const MANIFEST_PATH = path.join(__dirname, 'map-manifest.generated.json');

export default async function globalSetup(): Promise<void> {
  const baseUrl = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');

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
        'a[href^="/events/"], a[href^="/parking/"], a[href^="/operations/"], a[href^="/campus/"], a[href^="/kiosk/"]',
        false
      );

      for (const href of await internalLinks()) {
        if (MAP_ROUTE.test(href)) {
          maps.add(href);
        }
      }
    }

    const manifest: MapManifest = {
      baseUrl,
      discoveredAt: new Date().toISOString(),
      maps: [...maps].sort()
    };

    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

    console.log(`[smoke] discovered ${manifest.maps.length} maps on ${baseUrl}`);
  } finally {
    await browser.close();
  }
}
