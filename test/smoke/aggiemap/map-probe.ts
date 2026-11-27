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

/**
 * A layer as the probe's `snapshot()` reports it: the fields the suite's specs read, declared once (#3473) where four
 * specs each declared their own. A copy of part of `MapProbeLayer` in the library, for the reason `PROBE_GLOBAL` is.
 */
export interface ProbeLayer {
  id: string;
  title: string;
  type: string;
  visible: boolean;
  loaded: boolean;
  error: string | null;
  featureCount: number | null;
  graphicTypes: Record<string, number> | null;
}

export interface MapDrawnOptions {
  /** How long to wait. Each caller keeps its own: they differ, and choosing one for all of them is #3369's question. */
  timeout?: number;
  /**
   * Whether the probe must also be `ready` at the same reading. Default true, and it should be: with no view the probe
   * reports `drawing` as false, so `drawing` alone can read as finished before the map exists, and `ready` goes false
   * again while a layer that arrives late loads. `false` keeps a call site that waited on `drawing` alone exactly as it
   * was (#3473 is a refactor); each says why it may.
   */
  ready?: boolean;
  /**
   * Asked of the map's layers at that same reading; the wait goes on until it says yes, and the layers it accepted are
   * returned. Given only where a spec needs the layers: the snapshot that reads them asks every layer for its feature
   * count, so it is not taken otherwise.
   */
  until?: (layers: ProbeLayer[]) => boolean;
}

/**
 * Waits until the map on the page has finished drawing: its probe not `drawing`, and `ready` at the same reading (#3473),
 * polled each second. Ten specs wrote this by hand, with five timeouts and three ideas of "finished"
 * (docs/testing-maps.md says which signal answers which question). `message` says which map never finished, as each
 * spec's did. Returns the layers `until` accepted, or none when it is not given.
 *
 * A timeout also says which condition was unmet at the last reading (#3369): no probe on the page, not ready, ready but
 * still drawing, or drawn with layers `until` did not accept, listed. It said only the spec's message, so a slow draw
 * read as a broken map: Muster failed three times as "never finished drawing both layers" with both layers drawn in its
 * screenshot, and its order assertion had never run. What passes and fails is unchanged; only what a failure says.
 */
export async function waitForMapDrawn(
  page: Page,
  message: string,
  { timeout = 90_000, ready = true, until }: MapDrawnOptions = {}
): Promise<ProbeLayer[]> {
  let accepted: ProbeLayer[] = [];
  let last = 'the page was never read';

  try {
    await expect
      .poll(
        async () => {
          const reading = await page.evaluate(
            async ({ name, ready, withLayers }) => {
              const probe = (
                window as unknown as Record<
                  string,
                  { ready?: boolean; drawing?: boolean; snapshot: () => Promise<{ layers: ProbeLayer[] }> } | undefined
                >
              )[name];

              if (!probe) {
                return { unmet: 'absent' as const };
              }

              if (ready && probe.ready !== true) {
                return { unmet: 'not ready' as const };
              }

              if (probe.drawing !== false) {
                return { unmet: 'drawing' as const };
              }

              return { layers: withLayers ? (await probe.snapshot()).layers : [] };
            },
            { name: PROBE_GLOBAL, ready, withLayers: until !== undefined }
          );

          if ('unmet' in reading) {
            last = UNMET[reading.unmet];

            return false;
          }

          if (until !== undefined && !until(reading.layers)) {
            last = `the map had finished drawing, but its layers were not the ones asked for: ${describeLayers(reading.layers)}`;

            return false;
          }

          accepted = reading.layers;

          return true;
        },
        { message, timeout, intervals: [1_000] }
      )
      .toBe(true);
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${error.message}\n\nAt the last reading, ${last}.`;
    }

    throw error;
  }

  return accepted;
}

/** What each unmet condition means, for the timeout's message. */
const UNMET = {
  absent: `the page had no map probe (window.${PROBE_GLOBAL}): the build it serves is older than the probe, or it is not a map page`,
  'not ready': 'the map probe was not ready: a layer was still loading',
  drawing: 'the map probe was ready but still drawing'
} as const;

/** The layers `until` was offered, so a timeout shows whether they were even there. */
function describeLayers(layers: ProbeLayer[]): string {
  if (layers.length === 0) {
    return 'none';
  }

  return `${layers.length} (${layers
    .map((l) => `${l.id}${l.visible ? '' : ' hidden'}${l.loaded ? '' : ' not loaded'}${l.error ? ` error: ${l.error}` : ''}`)
    .join(', ')})`;
}
