import { Page } from '@playwright/test';

import { TAMU_CAMPUS_FEATURES_URL } from '../../../libs/common/datasets/geographic/src/lib/campus/campus-basemap';
import { expect, HEAVY, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { blockAnalytics } from './analytics';
import { smokeBaseUrl } from './gis-hosts';
import { PROBE_GLOBAL } from './map-probe';

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

/** How long the map is given to report itself ready before the load is abandoned. */
const READY_TIMEOUT_MS = 120_000;

/**
 * How long a load's queries are given to settle, and how long they must stop arriving for before the count is taken.
 *
 * This replaced a flat `waitForTimeout(5_000)`, which counted whatever had arrived five seconds after `ready` and
 * nothing after. On an idle machine that was 36, 32 or 16 queries for the same page; in the release run on 23 November
 * 2026, with the tier's other specs running beside it, **2 of 10 loads were counted as sending none at all**, and the
 * check failed on its own premise rather than on the failure rate it exists to measure (#3364). The service had
 * answered every query.
 *
 * So a load is counted once its queries have stopped arriving, not at a fixed moment. A load that genuinely never
 * queries the service still fails, after SETTLE_TIMEOUT_MS, which is what the premise is for.
 */
const SETTLE_QUIET_MS = 3_000;
const SETTLE_TIMEOUT_MS = 45_000;
const SETTLE_POLL_MS = 250;

/** The window each load is made in, which decides how many queries it sends (see below). */
const VIEWPORT = { width: 1280, height: 950 };

interface Load {
  queries: number;
  failed: number;
  settled: 'settled' | 'timed out';
}

/**
 * Waits until `count()` has stopped growing for SETTLE_QUIET_MS and has reached at least MIN_QUERIES_PER_LOAD, or
 * until SETTLE_TIMEOUT_MS has passed. Returns how it ended, so the caller can say which loads were slow rather than
 * only how many queries they sent.
 */
async function waitForQueriesToSettle(page: Page, count: () => number): Promise<'settled' | 'timed out'> {
  const started = Date.now();
  let seen = -1;
  let unchangedSince = started;

  while (Date.now() - started < SETTLE_TIMEOUT_MS) {
    const now = count();

    if (now !== seen) {
      seen = now;
      unchangedSince = Date.now();
    } else if (now >= MIN_QUERIES_PER_LOAD && Date.now() - unchangedSince >= SETTLE_QUIET_MS) {
      return 'settled';
    }

    await page.waitForTimeout(SETTLE_POLL_MS);
  }

  return 'timed out';
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
    { timeout: READY_TIMEOUT_MS, polling: 500 }
  );
  // The queries for the tiles in view are sent while the layers load, and on a busy machine they start after `ready`.
  const settled = await waitForQueriesToSettle(page, () => answers.length);

  const failed = (await Promise.all(answers)).filter(Boolean).length;

  return { queries: answers.length, failed, settled };
}

test.describe('the campus features service answers the main map', () => {
  test.describe.configure({ retries: 0 });

  test(
    `no more than ${(MAX_FAILED_RATE * 100).toFixed(1)}% of its queries fail, across ${LOADS} loads`,
    HEAVY,
    async ({ browser }) => {
      // Per load: the map reporting itself ready, its queries settling, and room for the load itself. Expressed from
      // the parts so a change to either wait cannot quietly push a run past its own timeout (#3364).
      test.setTimeout(LOADS * (READY_TIMEOUT_MS + SETTLE_TIMEOUT_MS + 15_000));

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

      // A load whose queries never stopped arriving is worth naming: before #3364 it was indistinguishable from a load
      // that sent none, because both were counted at a fixed five seconds.
      const slow = loads.filter((load) => load.settled === 'timed out');

      const measured =
        `${failed} of ${queries} failed (${(rate * 100).toFixed(2)}%) across ${LOADS} loads; ` +
        `per load: ${loads.map((load) => `${load.failed}/${load.queries}`).join(' ')}` +
        (slow.length > 0 ? `; ${slow.length} load(s) never settled within ${SETTLE_TIMEOUT_MS / 1_000}s` : '');

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
