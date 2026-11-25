import { expect, test } from './fixtures';
import { APP_ROOT } from './global-setup';
import { Ga4Event, ga4Events, isAnalyticsRequest } from './analytics';
import { smokeBaseUrl } from './gis-hosts';

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
  smokeBaseUrl()
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
   * A route change is a page view, counted once (#3338). AggieMap is one page to the browser, so moving from one of its
   * pages to another is a page view only if something reports it. Today that is the GA4 property's own history tracking
   * (enhanced measurement), measured on 24 November 2026 on dev and production: angulartics2's gtag provider sends page
   * views only to the ids it is configured with, and AggieMap configures none.
   *
   * **Exactly one**, not "at least one". It fails at zero, if the property's history tracking is turned off with nothing
   * in its place, and at two, if the application starts sending page views while the property still does: a doubled
   * count looks plausible where a missing one does not.
   */
  test("a route change is reported as exactly one page view, to this site's property", async ({ page }) => {
    const tagIds: Array<string | null> = [];
    const events: Array<Ga4Event> = [];

    page.on('request', (request) => {
      const url = request.url();

      if (url.includes('googletagmanager.com/gtag/js')) {
        tagIds.push(new URL(url).searchParams.get('id'));
      }

      if (isAnalyticsRequest(url) && url.includes('/collect')) {
        events.push(...ga4Events(url, request.postData()));
      }
    });

    await page.goto('/about');
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();
    await expect.poll(() => tagIds.length, { message: 'no gtag.js request was made', timeout: 30_000 }).toBeGreaterThan(0);

    // An in-app link, so the router changes the page and the browser does not load it.
    await page.locator('a[href="/directory"]').first().click();
    await expect(page).toHaveURL(/\/directory$/);

    const views = () => events.filter((e) => e.name === 'page_view' && (e.location ?? '').includes('/directory'));

    await expect
      .poll(() => views().length, {
        message: 'moving from /about to /directory in the application sent no page view',
        timeout: 30_000
      })
      .toBeGreaterThan(0);

    // A second page view for the same move arrives within a few seconds when there is one.
    await page.waitForTimeout(10_000);

    expect(
      views().map((e) => e.location),
      'moving from /about to /directory must be one page view, not one per source'
    ).toHaveLength(1);
    expect(views()[0].property, "the page view went to another property than this site's tag").toBe(tagIds[0]);
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
