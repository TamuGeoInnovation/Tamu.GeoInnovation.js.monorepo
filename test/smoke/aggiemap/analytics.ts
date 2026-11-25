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

/** One event a GA4 collect request carries: its name, the address it was about, and the property it went to. */
export interface Ga4Event {
  name: string | null;
  location: string | null;
  property: string | null;
}

/**
 * The events in a GA4 `/collect` request (#3338). gtag.js puts one event in the address, or batches several as lines of
 * the body, each with its own `en` (name) and, where it differs, `dl` (address), over the address's shared ones.
 */
export function ga4Events(url: string, body: string | null): Array<Ga4Event> {
  const shared = new URL(url).searchParams;
  const lines = (body ?? '').split('\n').filter((line) => line.trim() !== '');
  const each = lines.length > 0 ? lines.map((line) => new URLSearchParams(line)) : [new URLSearchParams()];

  return each.map((own) => ({
    name: own.get('en') ?? shared.get('en'),
    location: own.get('dl') ?? shared.get('dl'),
    property: own.get('tid') ?? shared.get('tid')
  }));
}
