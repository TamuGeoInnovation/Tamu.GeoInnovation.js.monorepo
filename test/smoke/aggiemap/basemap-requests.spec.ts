import { Page } from '@playwright/test';

import { TAMU_CAMPUS_FEATURES_URL } from '../../../libs/common/datasets/geographic/src/lib/campus/campus-basemap';
import { expect, HEAVY, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { blockAnalytics } from './analytics';
import { smokeBaseUrl } from './gis-hosts';

/**
 * The campus features service answers the main map's feature queries (#2702, #2722).
 *
 * The main map's buildings and surface lots are a feature service the map queries tile by tile: the one the vector
 * basemap is published from (`TAMU_CAMPUS_FEATURES_URL`). Until November 2026 they came from the campus basemap
 * MapServer, which failed some of them at random - about 1.5% of a load's queries when measured on 6 and 8 November
 * 2026, about one buildings query in twenty - and the map does not ask again. A load that loses a buildings tile shows a
 * square of campus where no building can be clicked for the rest of the visit (#2707). That is why they moved, and this
 * watches that the service they moved to does not start doing the same.
 *
 * Nothing else in the suite sees this. The failures come back as **HTTP 200** with the error in the body
 * (`{"error":{"code":500,"message":"Error performing query operation"}}`), so the server-error check in `maps.spec.ts`,
 * which reads the status, passes them.
 *
 * **Why a rate across several loads, not a rule per load.** At 1.5%, about one load in ten loses two queries, so "no
 * load loses more than one" would fail two runs in three on today's service and teach everyone to ignore it. Across
 * 10 loads (360 queries), a ceiling of 4% fails about one run in 2,300 at today's rate, four in five at 5%, and every
 * run at 8%. So this does not fail on the fault as it is, which is the GIS team's to fix; it fails if it gets markedly
 * worse, and it records the rate on every run, so the fix, or a slow drift, can be read from the report.
 *
 * Both numbers can be changed without editing this file: `AGGIEMAP_SMOKE_BASEMAP_LOADS` and
 * `AGGIEMAP_SMOKE_BASEMAP_MAX_FAILED_RATE`.
 */

const LOADS = Number(process.env.AGGIEMAP_SMOKE_BASEMAP_LOADS ?? 10);
const MAX_FAILED_RATE = Number(process.env.AGGIEMAP_SMOKE_BASEMAP_MAX_FAILED_RATE ?? 0.04);

/** Fewer than this many queries a load means the map no longer queries the service as it did, so the rate means nothing. */
const MIN_QUERIES_PER_LOAD = 10;

/** The window each load is made in, which decides how many queries it sends (see below). */
const VIEWPORT = { width: 1280, height: 950 };

const PROBE_GLOBAL = '__tamuGiscMapProbe';

interface Load {
  queries: number;
  failed: number;
}

/** Loads the main map once, and counts its feature queries to the campus features service and those answered with an error. */
async function loadAndCount(page: Page): Promise<Load> {
  const answers: Array<Promise<boolean>> = [];

  page.on('response', (response) => {
    const url = response.url();

    if (url.startsWith(`${TAMU_CAMPUS_FEATURES_URL}/`) && /\/query\?/.test(url)) {
      answers.push(
        response
          .text()
          .then((body) => response.status() >= 400 || /"error"\s*:/.test(body))
          .catch(() => true)
      );
    }
  });

  const response = await page.goto('/map/d');

  expect(response?.status(), '/map/d did not return 200').toBe(200);
  await expect(page.locator(APP_ROOT)).not.toBeEmpty();
  await page.waitForFunction(
    (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
    PROBE_GLOBAL,
    { timeout: 120_000, polling: 500 }
  );
  // The queries for the tiles in view are sent while the layers load; give the last answers time to arrive.
  await page.waitForTimeout(5_000);

  const failed = (await Promise.all(answers)).filter(Boolean).length;

  return { queries: answers.length, failed };
}

test.describe('the campus features service answers the main map', () => {
  test.describe.configure({ retries: 0 });

  test(
    `no more than ${(MAX_FAILED_RATE * 100).toFixed(1)}% of its queries fail, across ${LOADS} loads`,
    HEAVY,
    async ({ browser }) => {
      test.setTimeout(LOADS * 150_000);

      const loads: Load[] = [];

      for (let load = 1; load <= LOADS; load++) {
        // A fresh context each time, so nothing a load has cached hides what the next one asks. A context made by hand
        // does not inherit the config's `use`, so it is given the address the suite targets, and a window of its own:
        // the number of queries a load sends follows the tiles in view, 24 at Playwright's default 1280 x 720 and the
        // 36 the threshold above was worked out for at this size.
        const context = await browser.newContext({ baseURL: smokeBaseUrl(), viewport: VIEWPORT });
        const page = await context.newPage();

        await blockAnalytics(page);
        loads.push(await loadAndCount(page));
        await context.close();
      }

      const queries = loads.reduce((sum, load) => sum + load.queries, 0);
      const failed = loads.reduce((sum, load) => sum + load.failed, 0);
      const rate = queries === 0 ? 0 : failed / queries;

      const measured =
        `${failed} of ${queries} failed (${(rate * 100).toFixed(2)}%) across ${LOADS} loads; ` +
        `per load: ${loads.map((load) => `${load.failed}/${load.queries}`).join(' ')}`;

      // Annotated for the HTML report, and logged because a local run's list reporter shows no annotations: the rate is
      // what this check is for, passing or not.
      test.info().annotations.push({ type: 'basemap queries (#2702)', description: measured });
      console.log(`[smoke] basemap queries (#2702): ${measured}`);

      expect(
        loads.filter((load) => load.queries < MIN_QUERIES_PER_LOAD).map((load) => load.queries),
        `loads of /map/d that sent fewer than ${MIN_QUERIES_PER_LOAD} queries to ${TAMU_CAMPUS_FEATURES_URL}, so the ` +
          `map no longer reads its features from it as this check assumes`
      ).toEqual([]);
      expect(
        rate,
        `${failed} of ${queries} queries to the campus features service failed across ${LOADS} loads, above the ` +
          `${(MAX_FAILED_RATE * 100).toFixed(1)}% this check allows (#2702). Measured at about 1.5% in November 2026; ` +
          `this much more means the service has got worse, not that this run was unlucky`
      ).toBeLessThanOrEqual(MAX_FAILED_RATE);
    }
  );
});
