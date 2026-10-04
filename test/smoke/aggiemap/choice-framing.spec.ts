import { expect, test } from '@playwright/test';

import { blockAnalytics } from './analytics';

/**
 * An event map framed by its builder choice opens where that choice says (#1379).
 *
 * Some event maps frame themselves per choice rather than per map: each Ring Day day and each Fish
 * Camp session carries its own `mapView` center and zoom. When ArcGIS went from 4.23 to 4.27 every
 * one of them started opening at the default campus zoom instead. The event service framed the map
 * before the view was ready; 4.23 waited for the view and 4.27 silently drops the request. Every
 * layer still loaded and drew, so nothing else in this suite noticed - it was found by eye.
 *
 * The expected framing is copied from the definitions. They cannot be imported here (see
 * `global-setup.ts`), and an environment does not publish them. A definition retuned without this
 * list fails here, which is a prompt to update the list rather than a false alarm worth avoiding.
 *
 * Move-In frames per residence-hall area the same way, but needs a date and a hall chosen in its
 * builder, and is out of season; it shares this code path, so these cases cover it.
 */

const PROBE_GLOBAL = '__tamuGiscMapProbe';

interface Framing {
  zoom: number;
  center: [number, number];
}

const CASES: { route: string; expected: Framing }[] = [
  { route: '/events/ring-day/map/d?event-day=day1', expected: { zoom: 18, center: [-96.3354, 30.6095] } },
  { route: '/events/ring-day/map/d?event-day=day2', expected: { zoom: 17, center: [-96.3405, 30.6088] } },
  {
    route: '/events/fish-camp/map/d?fish-camp-session=sessions-a-f',
    expected: { zoom: 17, center: [-96.34624, 30.60582] }
  },
  { route: '/events/fish-camp/map/d?fish-camp-session=session-g', expected: { zoom: 17, center: [-96.3338, 30.61118] } }
];

/** About ten metres. A `goTo` lands exactly; the default framing is hundreds of metres away. */
const CENTER_TOLERANCE_DEGREES = 0.0001;

function lands(actual: Framing | null, expected: Framing): boolean {
  return (
    actual !== null &&
    Math.abs(actual.zoom - expected.zoom) < 0.05 &&
    Math.abs(actual.center[0] - expected.center[0]) < CENTER_TOLERANCE_DEGREES &&
    Math.abs(actual.center[1] - expected.center[1]) < CENTER_TOLERANCE_DEGREES
  );
}

test.describe('an event map opens on its builder choice', () => {
  for (const { route, expected } of CASES) {
    test(`${route} opens at zoom ${expected.zoom} on its configured center`, async ({ page }) => {
      await blockAnalytics(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      await expect
        .poll(
          async () =>
            await page.evaluate(
              (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
              PROBE_GLOBAL
            ),
          { message: `${route} never finished loading`, timeout: 90_000, intervals: [1_000] }
        )
        .toBe(true);

      const framing = async (): Promise<Framing | null | undefined> =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { framing?: Framing | null }>)[name]?.framing,
          PROBE_GLOBAL
        );

      // Skipped rather than failed, as the other probe-based specs do: "deploy a newer build", not
      // "the framing is broken".
      test.skip((await framing()) === undefined, "this build's map probe predates framing, so it cannot be checked");

      // Polled, because framing animates: 4.23 took about half a second from the view becoming ready.
      let last: Framing | null | undefined;

      await expect
        .poll(
          async () => {
            last = await framing();

            return lands(last ?? null, expected);
          },
          { timeout: 30_000, intervals: [500] }
        )
        .toBe(true)
        .catch(() => {
          throw new Error(
            `${route} opened at zoom ${last?.zoom?.toFixed(2)} centered on ${last?.center?.map((c) => c.toFixed(5)).join(', ')}, ` +
              `not its choice's zoom ${expected.zoom} centered on ${expected.center.join(', ')}`
          );
        });
    });
  }
});
