import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';


/**
 * The build banner names the build a page is running (#1306).
 *
 * `build-traceability.constants.ts` ships `___BUILD_DATE___` and friends, and something replaces them
 * with real values at deploy time. That something is `tokenSubstitute.sh`, which runs in the
 * Dockerfile - and dev and production serve AggieMap from IIS, not from the container image, so it
 * never runs and the placeholders reach the browser.
 *
 * The cost is not cosmetic. The banner is how you tell from a browser which commit a page is running,
 * which is what makes the `dev-*` and `prod-*` tags checkable rather than asserted. Without it,
 * "production is on the commit we tested" is a claim nobody can verify from the outside.
 *
 * Confirmed on 2 October in the live bundles of both environments, not inferred.
 */

/** Any token the banner is built from, left unsubstituted. */
const PLACEHOLDER = /___[A-Z_]+___/;

/** The environment under test, as every other helper here resolves it. */
const BASE_URL = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');

function allowance(): string | undefined {
  const environments = JSON.parse(fs.readFileSync(path.join(__dirname, 'environments.json'), 'utf8')) as Record<
    string,
    { baseUrl: string; allowedBuildBannerPlaceholders?: string }
  >;
  const base = BASE_URL;
  const match = Object.values(environments).find((env) => env.baseUrl.replace(/\/$/, '') === base);

  return match?.allowedBuildBannerPlaceholders;
}

test.describe('the build banner', () => {
  test('names the build rather than printing its placeholders', async ({ page }) => {
    const banner: string[] = [];

    page.on('console', (message) => {
      const text = message.text();

      if (text.includes('Build Date:') || PLACEHOLDER.test(text)) {
        banner.push(text);
      }
    });

    await page.goto(`${BASE_URL}/map`, { waitUntil: 'domcontentloaded' });
    // The banner is printed while the environment module initialises, which is early, but the console
    // listener has to be given the turn of the event loop to receive it.
    await page.waitForTimeout(3_000);

    const printed = banner.join('\n');
    const held = allowance();

    expect(printed, 'the environment module printed no build banner at all').toContain('Build Date:');

    if (held) {
      // Not fixed yet, and it stays visible rather than silently passing: the day the pipeline starts
      // substituting, this flips and the allowance should be removed with it.
      test.info().annotations.push({ type: 'known failure', description: held });
      expect(printed, `expected the known placeholders while ${held} is open`).toMatch(PLACEHOLDER);

      return;
    }

    expect(printed, 'the build banner still contains ___TOKEN___ placeholders, so the build cannot be identified').not.toMatch(
      PLACEHOLDER
    );
  });
});
