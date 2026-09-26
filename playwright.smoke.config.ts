import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke configuration, run against an already-deployed environment.
 *
 * Intentionally small and read-only. It answers "is the deployed site actually serving?" and
 * nothing more, so it is safe to point at production and cheap to run on a schedule. It starts no
 * server and must never assert on anything that mutates state.
 *
 * Detailed behaviour belongs in the local suite (`playwright.config.ts`), which can gate a PR.
 * This one cannot -- a failure here may mean the deployment is broken, not the commit.
 */
export default defineConfig({
  testDir: './test/smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.SMOKE_BASE_URL ?? 'https://txgisday.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false,
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
