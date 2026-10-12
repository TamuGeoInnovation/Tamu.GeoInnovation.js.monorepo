import { expect, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { isAnalyticsRequest } from './analytics';

/**
 * Checks that analytics is actually wired up in the deployed build. Companion to #699.
 *
 * Deliberately **not** blocked, unlike the rest of the suite: this is the one place that wants the
 * requests to happen, because observing them is what proves the tag works. It is a handful of
 * interactions, not the bulk traffic the other specs would generate.
 *
 * Why assert on the outgoing requests rather than read the property: the failures that actually
 * happen are client-side -- the snippet dropped from `index.html`, the placeholder left
 * unsubstituted by a deploy, the Angulartics wiring broken by a refactor. All of those are visible
 * in the network, immediately, without credentials. Confirming that rows landed in the property is a
 * different question and needs access to the property itself.
 */

/** `index.html` ships this literal, substituted with the real measurement id at deploy time. */
const UNSUBSTITUTED_PLACEHOLDER = 'G_TAG';

/**
 * Expected measurement id for the environment under test, e.g. `G-XXXXXXXXXX`.
 *
 * Optional, and skipped when unset, because the real ids are not in the repository -- only the
 * placeholder is. Setting it is what turns "analytics is reporting somewhere" into "analytics is
 * reporting to the right property", which is the failure that silently corrupts the numbers: a dev
 * deploy pointing at the production property looks perfectly healthy from the outside.
 */
const EXPECTED_ID = process.env.AGGIEMAP_EXPECTED_GTAG_ID;

/**
 * `G_TAG` is substituted when the container starts, so a dev server run from source genuinely has no
 * analytics -- `gtag.js` is requested with the literal placeholder and Google rejects it.
 *
 * That is correct behaviour locally, not a defect, so these are skipped rather than failed against a
 * local origin. Failing would mean the suite could never be run clean on a developer's machine, which
 * teaches people to ignore it.
 */
const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(
  process.env.AGGIEMAP_SMOKE_BASE_URL ?? ''
);

interface TagRequest {
  url: string;
  id: string | null;
}

test.describe('analytics', () => {
  test.skip(
    () => IS_LOCAL,
    'a dev server serves the unsubstituted G_TAG placeholder, so there is no analytics to verify'
  );

  test('the gtag snippet loads with a real measurement id', async ({ page }) => {
    const tagRequests: TagRequest[] = [];

    page.on('request', (request) => {
      const url = request.url();

      if (url.includes('googletagmanager.com/gtag/js')) {
        tagRequests.push({ url, id: new URL(url).searchParams.get('id') });
      }
    });

    await page.goto('/map');
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();

    // Loaded `async`, so it can arrive after the app renders.
    await expect
      .poll(() => tagRequests.length, { message: 'no gtag.js request was made, so the tag is absent', timeout: 30_000 })
      .toBeGreaterThan(0);

    const ids = tagRequests.map((request) => request.id);

    // A deploy that failed to substitute the placeholder still serves a working site, and sends
    // nothing anywhere. Nothing else would notice.
    expect(ids, `gtag.js was requested with the unsubstituted '${UNSUBSTITUTED_PLACEHOLDER}' placeholder`).not.toContain(
      UNSUBSTITUTED_PLACEHOLDER
    );

    for (const id of ids) {
      expect(id, 'gtag.js was requested without a measurement id').not.toBeNull();
      expect(id, `'${id}' does not look like a GA4 measurement id`).toMatch(/^(G-|UA-|GT-)/);
    }

    if (EXPECTED_ID !== undefined) {
      expect(ids, `analytics is reporting to the wrong property for this environment`).toContain(EXPECTED_ID);
    }
  });

  test('a page view is reported', async ({ page }) => {
    const collects: string[] = [];

    page.on('request', (request) => {
      const url = request.url();

      if (isAnalyticsRequest(url) && url.includes('/collect')) {
        collects.push(url);
      }
    });

    await page.goto('/map');
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();

    await expect
      .poll(() => collects.length, {
        message:
          'no analytics collect request was sent. The tag may be present but not configured, or the ' +
          'measurement id may be rejected by Google.',
        timeout: 45_000
      })
      .toBeGreaterThan(0);
  });

  /**
   * The interaction path, rather than just the base tag.
   *
   * `index.html` firing a pageview proves the snippet is present. It does not prove the application's
   * own tracking still works -- that runs through Angulartics, which a refactor can quietly
   * disconnect while the base tag keeps reporting perfectly.
   */
  test('an interaction is reported as an event', async ({ page }) => {
    const events: string[] = [];

    page.on('request', (request) => {
      const url = request.url();

      if (isAnalyticsRequest(url) && url.includes('/collect')) {
        const name = new URL(url).searchParams.get('en');

        if (name !== null && name !== 'page_view') {
          events.push(name);
        }
      }
    });

    // A builder is the shortest path to an instrumented interaction: choosing an option calls
    // `saveOption`, which tracks an event. Any builder-gated map would do.
    await page.goto('/events/big-event');

    const option = page.locator('.container12 [tabindex="0"]').first();
    const reachedBuilder = await option
      .waitFor({ state: 'visible', timeout: 60_000 })
      .then(() => true)
      .catch(() => false);

    // Skipped rather than failed: this map may not be published in every environment, and "the
    // interaction was not reachable" is not evidence that analytics is broken. Failing here would be
    // a false alarm in the scheduled run, which is worse than a gap.
    test.skip(!reachedBuilder, 'no builder options rendered on /events/big-event in this environment');

    await option.click();

    await expect
      .poll(() => events.length, {
        message:
          'choosing a builder option sent no analytics event. The base tag may still be reporting ' +
          'page views while the application-level tracking is disconnected.',
        timeout: 45_000
      })
      .toBeGreaterThan(0);
  });
});
