import * as fs from 'fs';

import { expect, test } from './fixtures';
import { MANIFEST_PATH, MapManifest } from './global-setup';

/**
 * Event maps agree about whether their event is over, at College Station time (#1302).
 *
 * Two date faults reached production on 1 October and were found by eye, not by this suite:
 *
 * - #1298: a map said "This event has passed" from 7 PM the evening *before* the event, because the
 *   date was read as UTC midnight while the visitor is in Central time.
 * - #1301: All Maps dropped an event from Upcoming events on the day it was happening.
 *
 * Both have unit tests now. Nothing checked the **deployed** site, where the date, the time zone and
 * the definitions actually come together - and the time zone is the part a unit test cannot speak
 * for, because the container runs in UTC and the visitor does not.
 *
 * These drive themselves from the maps the environment serves, so a new event is covered without
 * touching this file.
 */

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/**
 * Every event map this environment serves.
 *
 * No dates are needed below, which is the point. The deployed site does not publish event dates in
 * any usable form - All Maps' Upcoming cards are `div`s with a click handler rather than links, and
 * an event map does not render its own dates - so a check that needs them would have to read the
 * definitions from the branch instead of the environment, and would then be testing the wrong thing
 * whenever a site lags the branch. See #1320.
 */
const eventMaps = manifest.maps.filter((route) => route.startsWith('/events/'));

const PASSED_WARNING = '.event-passed-modal';
const MAP_NOTICE = '.map-notice-modal';

/** Long enough that every real event is over, and long enough that none has begun. */
const WELL_AFTER = new Date('2030-01-15T12:00:00');
const WELL_BEFORE = new Date('2020-01-15T12:00:00');

test.use({ timezoneId: 'America/Chicago' });

test.describe('an event map knows whether its event is over', () => {
  test('the environment serves some event maps to check', () => {
    // Without this, a discovery change that stops listing them would empty this file and still be
    // reported as green.
    expect(eventMaps.length, 'no /events/ maps were discovered, so nothing below ran').toBeGreaterThan(0);
  });

  for (const route of eventMaps) {
    test(`${route} does not say the event has passed long before it`, async ({ page }) => {
      await page.clock.setFixedTime(WELL_BEFORE);
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Given time to appear, rather than asserted the instant the page loads - otherwise this passes
      // simply by being quicker than the modal.
      await page.waitForTimeout(8_000);

      await expect(
        page.locator(PASSED_WARNING),
        `${route} called its event over before it had happened`
      ).toHaveCount(0);
    });

    test(`${route} never opens the warning and a notice together`, async ({ page }) => {
      // Two modals open at once left the second as an empty box with only its close button (#1298).
      await page.clock.setFixedTime(WELL_AFTER);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(8_000);

      const both = (await page.locator(PASSED_WARNING).count()) > 0 && (await page.locator(MAP_NOTICE).count()) > 0;

      expect(both, `${route} opened the passed-event warning and a map notice together`).toBe(false);
    });
  }
});

/**
 * The two surfaces must not disagree.
 *
 * All Maps decides "upcoming" and each event map decides "has passed", from the same dates by
 * different code. #1298 and #1301 were both that disagreement showing - so rather than re-deriving
 * the dates here, which means parsing a formatted range back out of the page, this asserts the two
 * answers are consistent. It needs no knowledge of any event's dates and keeps working as they change.
 */
test.describe('All Maps and the event maps agree', () => {
  test('no event listed as upcoming is shown as already over', async ({ page }) => {
    // All Maps decides "upcoming" and each event map decides "has passed", from the same dates by
    // different code. #1298 and #1301 were both that disagreement showing. Asserting the two answers
    // are consistent needs no dates and keeps working as the events change.
    await page.goto('/all-maps', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.upcoming-events-section', { timeout: 60_000 });

    // The cards are `div`s with a click handler rather than links, so there is no href to read -
    // where each one leads is only knowable by doing what a visitor does.
    const cards = page.locator('.upcoming-events-section .event-card');
    const count = await cards.count();

    test.skip(count === 0, 'this environment lists no upcoming events today, so there is nothing to compare');

    const routes: string[] = [];

    for (let index = 0; index < count; index += 1) {
      await page.goto('/all-maps', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.upcoming-events-section .event-card', { timeout: 60_000 });
      await page.locator('.upcoming-events-section .event-card').nth(index).click();
      await page.waitForURL((url) => !url.pathname.startsWith('/all-maps'), { timeout: 30_000 });

      routes.push(new URL(page.url()).pathname);
    }

    expect(routes.length, 'clicking the upcoming cards led nowhere').toBeGreaterThan(0);

    for (const route of [...new Set(routes)]) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(6_000);

      await expect(
        page.locator(PASSED_WARNING),
        `All Maps lists ${route} as upcoming, but its own map says the event has passed`
      ).toHaveCount(0);
    }
  });
});
