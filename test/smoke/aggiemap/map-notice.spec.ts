import { expect, test } from '@playwright/test';

import { blockAnalytics } from './analytics';

/**
 * Map notices and the event toast that points at them.
 *
 * A notice is the thing a visitor has to see before using a map and that the map itself cannot show -
 * a venue change, a closure, a date move. It is configured on the event definition, so these checks
 * are about the mechanism rather than any one event: which map carries a notice changes, and these
 * tests read what is configured rather than hard-coding a date's worth of content.
 *
 * The dismissal check is the one worth having. A notice that reappears after being acknowledged is
 * merely annoying; one that never reappears in a new session is a notice nobody sees on the day.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';
const NOTICE = 'tamu-gisc-map-notice';

/** The event whose map carries a notice today. */
const MAP_WITH_NOTICE = '/events/150th-kickoff';
// Kickoff at Kyle deliberately: it is an event map like the one above, on the same date, with a toast
// but no notice. So a pass proves the trigger is conditional rather than simply not firing - which a
// map from a different part of the app would not.
const MAP_WITHOUT_NOTICE = '/events/kickoff-at-kyle';

async function openMap(page, path: string): Promise<void> {
  await blockAnalytics(page);
  await page.goto(path);
  await expect
    .poll(
      async () =>
        await page.evaluate((n) => (window as unknown as Record<string, { ready?: boolean }>)[n]?.ready === true, PROBE_GLOBAL),
      { message: `the map on ${path} never finished loading`, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);
}

test('a map with a notice shows it', async ({ page }) => {
  await openMap(page, MAP_WITH_NOTICE);

  await expect(page.locator(NOTICE), `${MAP_WITH_NOTICE} should show its notice`).toBeVisible({ timeout: 30_000 });
});

test('a map without a notice shows none', async ({ page }) => {
  await openMap(page, MAP_WITHOUT_NOTICE);

  await expect(page.locator(NOTICE), `${MAP_WITHOUT_NOTICE} has no notice configured`).toHaveCount(0);
});

test('a dismissed notice stays dismissed for the session, and returns in a new one', async ({ page, context }) => {
  await openMap(page, MAP_WITH_NOTICE);

  const notice = page.locator(NOTICE);
  await expect(notice).toBeVisible({ timeout: 30_000 });
  await notice.getByRole('button').first().click();
  await expect(notice, 'the notice should close when acknowledged').toHaveCount(0);

  // Same session, same tab: reloading must not bring it back.
  await openMap(page, MAP_WITH_NOTICE);
  await expect(page.locator(NOTICE), 'the notice came back in the same session').toHaveCount(0);

  // A new context is a new session, so it must show again - otherwise nobody sees it on the day.
  const fresh = await context.browser().newContext();
  const freshPage = await fresh.newPage();
  await openMap(freshPage, MAP_WITH_NOTICE);
  await expect(page.locator(NOTICE) && freshPage.locator(NOTICE), 'the notice should show again in a new session').toBeVisible({
    timeout: 30_000
  });
  await fresh.close();
});
