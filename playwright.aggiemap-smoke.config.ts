import { defineConfig, devices } from '@playwright/test';

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
    baseURL: process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
