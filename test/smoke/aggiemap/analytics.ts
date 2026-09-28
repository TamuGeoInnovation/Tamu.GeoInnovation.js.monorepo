import { Page } from '@playwright/test';

/**
 * Analytics handling for the smoke suites.
 *
 * Two jobs that pull in opposite directions, so they are kept apart:
 *
 * - **Bulk runs block.** The suite loads every map, daily. Left unblocked that is dozens of
 *   pageviews a day of synthetic traffic, indistinguishable from real visitors, contaminating the
 *   very data anyone would check. The builder inventory is worse -- it walks hundreds of selections,
 *   each of which fires an event.
 * - **`analytics.spec.ts` allows, and asserts.** Verifying that analytics works is a real
 *   requirement (#699), and it is done properly by observing the outgoing requests for a handful of
 *   deliberate interactions -- not as a side effect of flooding the property.
 *
 * `AGGIEMAP_SMOKE_ANALYTICS` overrides the default for a whole run: `block` (default) or `allow`.
 */

/** Hosts gtag.js loads from and reports to. */
export const ANALYTICS_HOSTS = ['googletagmanager.com', 'google-analytics.com', 'analytics.google.com'];

export type AnalyticsMode = 'block' | 'allow';

export function analyticsMode(): AnalyticsMode {
  return process.env.AGGIEMAP_SMOKE_ANALYTICS === 'allow' ? 'allow' : 'block';
}

export function isAnalyticsRequest(url: string): boolean {
  return ANALYTICS_HOSTS.some((host) => url.includes(host));
}

/**
 * Aborts analytics requests for this page, unless the run explicitly allows them.
 *
 * Aborting rather than fulfilling with an empty body: gtag.js is loaded `async` and nothing in the
 * application waits on it, so a failed request changes no behaviour the suite cares about.
 */
export async function blockAnalytics(page: Page): Promise<void> {
  if (analyticsMode() === 'allow') {
    return;
  }

  await page.route(
    (url) => isAnalyticsRequest(url.href),
    async (route) => {
      await route.abort();
    }
  );
}
