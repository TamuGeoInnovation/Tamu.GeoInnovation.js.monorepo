import { defineConfig, devices } from '@playwright/test';

/**
 * Photographs of GIS Day admin pages for a pull request's before and after images, without signing in (#3806):
 * `test/e2e/gisday/captures/*.capture.ts`, each built on `test/e2e/gisday/admin-capture.ts`. Run by hand, never by CI,
 * and gates nothing: docs/gisday-admin-capture.md says how.
 *
 * Each capture serves a static build itself, so there is no `webServer` and no `baseURL`. The full Chromium, not the
 * headless shell, so a PDF shown in the page is drawn by its viewer rather than left blank.
 */
export default defineConfig({
  testDir: './test/e2e/gisday/captures',
  testMatch: '**/*.capture.ts',
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [['list']],
  use: { ...devices['Desktop Chrome'], channel: 'chromium' }
});
