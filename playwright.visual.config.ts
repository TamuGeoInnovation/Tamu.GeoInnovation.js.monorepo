import { defineConfig, devices } from '@playwright/test';

/**
 * Visual baselines, compared against committed screenshots.
 *
 * Separate from the smoke configuration because it answers a different question. The smoke suite asks
 * "does every layer load and return data"; this asks "does the page still look right". They fail for
 * different reasons and want different reactions, so mixing them would make both harder to read.
 *
 * Deliberately not part of the pull request checks yet. A first run against a changed environment
 * finds differences that are not regressions, and that should not block anyone while the set is being
 * tuned. See #1067.
 *
 * Target with AGGIEMAP_VISUAL_BASE_URL; defaults to dev, because production is the environment whose
 * appearance should be *compared against*, not the one being iterated on.
 */
export default defineConfig({
  testDir: './test/visual',

  // Baselines are platform-specific: fonts and antialiasing differ between Windows, macOS and CI
  // Linux, so a baseline captured on a laptop fails everywhere else. Naming the directory without a
  // platform segment is deliberate - these are only ever captured and compared inside the Playwright
  // container, and a per-platform tree would quietly invite capturing them somewhere else.
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // No retries. A visual difference is not flaky - it either matches or it does not - and retrying
  // one would only hide a genuinely unstable page, which is exactly what we would want to know about.
  retries: 0,

  workers: process.env.CI ? 2 : 2,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit/playwright-visual.xml' }]]
    : [['list']],

  // A map is not fully drawn for around twenty seconds, and this waits for that rather than guessing.
  timeout: 120_000,
  expect: {
    timeout: 30_000,
    toHaveScreenshot: {
      // Antialiasing differs slightly run to run even on identical pixels. Small enough to ignore a
      // few stray pixels, far too small to hide a layout change.
      maxDiffPixelRatio: 0.01,
      // Chrome renders some text fractionally differently between runs; this is per-pixel colour
      // tolerance, not a licence for the layout to move.
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide'
    }
  },

  use: {
    baseURL: process.env.AGGIEMAP_VISUAL_BASE_URL ?? 'https://dev.aggiemap.tamu.edu',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: false,
    actionTimeout: 30_000,
    navigationTimeout: 60_000
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } }
  ]
});
