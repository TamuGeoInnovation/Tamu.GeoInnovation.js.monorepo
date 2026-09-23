import { defineConfig, devices } from '@playwright/test';

/**
 * Local end-to-end configuration.
 *
 * Runs against a dev server this config starts itself, so a run is hermetic and can gate a PR.
 * For the suite that runs against a deployed environment, see `playwright.smoke.config.ts`.
 *
 * Deliberately standalone rather than wired through `@nx/playwright`: that plugin postdates the
 * Nx 16 this workspace is on, and adopting it would couple this work to the Nx 16.10 upgrade in
 * #450. The cost is that Playwright does not participate in `nx affected`, so the suite runs on
 * every CI run rather than only when GIS Day changes. At this repository's commit rate that is
 * cheap, and it converts to the plugin later without the tests themselves changing.
 */
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // Angular's dev server is slow to boot on a cold cache; CI gets a generous budget.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npx nx serve gisday-angular',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
      },
});
