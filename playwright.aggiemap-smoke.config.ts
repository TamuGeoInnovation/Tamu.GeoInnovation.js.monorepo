import { defineConfig, devices } from '@playwright/test';

import { HEAVY } from './test/smoke/aggiemap/fixtures';
import { smokeBaseUrl } from './test/smoke/aggiemap/gis-hosts';
import { quickSetFor, routeGrep, ROUTE_SPECS } from './test/smoke/aggiemap/scope';

/**
 * AggieMap smoke configuration, run against an already-deployed environment.
 *
 * Separate from `playwright.smoke.config.ts` because that one targets GIS Day and defaults to a
 * different host. A single config covering both would run every AggieMap map against
 * `txgisday.org`.
 *
 * Separate from a single combined AggieMap run against both prod and dev because the two
 * environments differ by design -- the development GIS server does not host every service
 * production does -- so they need their own runs and their own expectations. See #1034.
 *
 * Read-only: AggieMap submits nothing, so pointing this at production is safe.
 *
 * Target with AGGIEMAP_SMOKE_BASE_URL; defaults to production.
 */
// The quick tier (#1717): run-local.sh sets the tier and the files changed since the last cleared
// build, and scope.ts turns them into two projects, because a file filter and a title filter given
// together select only what matches both. One runs the chosen spec files whole; the other runs the
// chosen routes in the per-route specs. Without the tier there is one project and everything runs.
const quick =
  process.env.AGGIEMAP_SMOKE_TIER === 'quick'
    ? quickSetFor((process.env.AGGIEMAP_SMOKE_CHANGED ?? '').split(',').filter(Boolean))
    : null;

const chrome = { ...devices['Desktop Chrome'] };

/**
 * Tests tagged `@heavy` run after everything else, two at a time (#1716).
 *
 * A few tests drive one map through many slow steps - 3D on every basemap, every zoom level, popup after
 * popup - each against its own clock. With six workers they share the machine with five other map loads,
 * and every step slows: a screenshot of a map still drawing took 2 to 7 seconds with eight CPUs and 8 to
 * 30 or more with one. Three such tests failed their first attempt in the release tiers of 18 October and
 * passed first time alone. They are not given longer clocks, which would hide a map that really had
 * become slow: they are given the machine they were measured on.
 *
 * The heavy project is the others' teardown, which Playwright starts once they have finished, whether
 * they passed or not. `--no-deps` drops that ordering, and run-local.sh's `one` passes it, so running one
 * spec does not also run every heavy test in the suite.
 */
const HEAVY_GREP = new RegExp(HEAVY.tag);
const heavy = (testMatch?: string[]) => ({
  name: 'heavy',
  use: chrome,
  grep: HEAVY_GREP,
  workers: 2,
  ...(testMatch ? { testMatch } : {})
});

export default defineConfig({
  testDir: './test/smoke/aggiemap',

  // Discovers which maps the target environment actually lists, and writes the manifest the spec
  // reads at collection time. Runs before test files are loaded, which is what lets one test be
  // generated per map.
  globalSetup: './test/smoke/aggiemap/global-setup.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,

  // Deliberately limited. Each test loads a full Esri map, and ~60 of those at once is enough to
  // make the GIS services the bottleneck, which shows up as timeouts that look like map failures.
  // Six locally since #1426, measured against dev without that happening; GitHub's runners stay at
  // four. If dev's services start timing out, go back to four rather than adding retries.
  workers: process.env.CI ? 4 : 6,

  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit/playwright-aggiemap-smoke.xml' }]]
    : [['list']],

  // Generous: a cold Esri load on a 60-layer map takes tens of seconds, and this suite has no
  // interest in performance -- only in whether the map works at all.
  timeout: 120_000,
  expect: { timeout: 30_000 },

  use: {
    baseURL: smokeBaseUrl(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false
  },

  projects: quick
    ? [
        {
          name: 'quick-files',
          use: chrome,
          testMatch: quick.specs.map((spec) => `**/${spec}`),
          grepInvert: HEAVY_GREP,
          teardown: 'heavy'
        },
        {
          name: 'quick-routes',
          use: chrome,
          testMatch: ROUTE_SPECS.filter((spec) => !quick.specs.includes(spec)).map((spec) => `**/${spec}`),
          grep: routeGrep(quick),
          teardown: 'heavy'
        },
        heavy(quick.specs.map((spec) => `**/${spec}`))
      ]
    : [{ name: 'chromium', use: chrome, grepInvert: HEAVY_GREP, teardown: 'heavy' }, heavy()]
});
