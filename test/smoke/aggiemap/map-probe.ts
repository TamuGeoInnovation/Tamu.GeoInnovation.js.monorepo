import { Page, expect } from '@playwright/test';

/**
 * The map probe's global (#1167), named once for the whole suite (#2603): every spec typed it out, eighteen of them, and
 * a missed one would fail only when the suite next ran against a live site.
 *
 * A copy of `MAP_PROBE_GLOBAL` in `libs/maps/esri/src/lib/services/map/map-probe.ts`, not an import: that file brings
 * the probe's whole type graph, which this suite's typecheck cannot load outside a bundler. `map-probe.spec.ts` there
 * pins the constant to this literal, so renaming it fails a unit test that points back here.
 */
export const PROBE_GLOBAL = '__tamuGiscMapProbe';

/**
 * Waits until the map on the page says it has finished loading: its probe's `ready` (#2603). Every spec waited this
 * way, by hand, with the same 90 seconds and the same one-second polling. `message` says which map never finished, as
 * each spec's did. A spec that has to act before the page loads, such as installing a fake clock, does so before its
 * own `goto`; this only waits.
 */
export async function waitForMapReady(page: Page, message: string): Promise<void> {
  await expect
    .poll(
      async () =>
        await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ),
      { message, timeout: 90_000, intervals: [1_000] }
    )
    .toBe(true);
}
