import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration for the builder destination inventory generator.
 *
 * Deliberately separate from `playwright.smoke.config.ts` and `playwright.aggiemap-smoke.config.ts`,
 * and outside `test/smoke`, so no scheduled run ever executes it: it drives the builders, takes tens
 * of minutes, and writes files into the repository. It is run by hand when the builders change.
 *
 * One worker and no retries on purpose. The walk is stateful — settings are held per browser context
 * and the builder navigates as options are chosen — so a retry would restart a partially-completed
 * walk and record a path nobody took.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 90 * 60 * 1000,

  use: {
    baseURL: process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false,

    // Explicit, because the default is no timeout at all. A selector that can never match -- the
    // review button's label is an input `value`, not text -- otherwise hangs the whole run rather
    // than failing the step, which is exactly what happened on the first attempt.
    actionTimeout: 30_000,
    navigationTimeout: 60_000
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
