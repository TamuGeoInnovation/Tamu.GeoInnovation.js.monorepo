import { Page } from '@playwright/test';

/**
 * Where a map opens: its zoom and `[longitude, latitude]` center, read from a loaded page.
 *
 * Shared by `framing.spec.ts` and anything else that needs to know where the view is looking.
 */

export interface Framing {
  zoom: number;
  center: [number, number];
}

const PROBE_GLOBAL = '__tamuGiscMapProbe';

/** How often the probe and the framing are read while waiting (#1426). */
const POLL_MS = 250;

/** How long the framing must stay the same to count as settled. */
const SETTLED_FOR_MS = 1_000;

/** How long to wait for it to settle before giving up and reporting the last reading. */
const SETTLE_TIMEOUT_MS = 30_000;

/**
 * The view's framing, or `null` when there is no map view or its framing cannot be read.
 *
 * The map probe's `framing` (#1379), which reports a WGS 84 center in any spatial reference (#1380).
 * Builds whose probe predates it - production until its first deploy after #1379 - fall back to Esri's
 * own list of live views: the apps load ArcGIS through esri-loader, so its AMD `require` is on
 * `window`, and `esri/views/View`'s `views` holds every view the page has created. The map is the 2D
 * one. Those builds frame every map in geographic or Web Mercator coordinates, which carry a longitude
 * and latitude, so the fallback has nothing to project.
 *
 * A probe with `framing` but from before #1380 reports `[null, null]` for a view in a projected
 * reference (dev's main map, Texas Centric, wkid 32139). That reads as `null` here, not as a framing.
 */
export async function readFraming(page: Page): Promise<Framing | null> {
  return await page.evaluate(async (probeName) => {
    const usable = (framing: Framing | null | undefined): Framing | null =>
      framing && [framing.zoom, ...framing.center].every((value) => typeof value === 'number' && Number.isFinite(value))
        ? framing
        : null;

    const probe = (window as unknown as Record<string, { framing?: Framing | null }>)[probeName];

    if (probe && 'framing' in probe) {
      return usable(probe.framing);
    }

    interface EsriView {
      type: string;
      zoom: number;
      center?: { longitude: number; latitude: number };
    }

    const amd = (window as unknown as { require?: (deps: string[], ok: (View: unknown) => void, fail?: () => void) => void })
      .require;

    if (typeof amd !== 'function') {
      return null;
    }

    return await new Promise<Framing | null>((resolve) => {
      setTimeout(() => resolve(null), 5_000);
      amd(
        ['esri/views/View'],
        (View) => {
          const views = (View as { views?: { toArray(): EsriView[] } }).views?.toArray() ?? [];
          const view = views.find((v) => v.type === '2d');

          resolve(view?.center ? usable({ zoom: view.zoom, center: [view.center.longitude, view.center.latitude] }) : null);
        },
        () => resolve(null)
      );
    });
  }, PROBE_GLOBAL);
}

/** The ArcGIS version the page loaded, from `esri/kernel`, or `null` if it cannot be read. */
export async function readEsriVersion(page: Page): Promise<string | null> {
  return await page.evaluate(
    async () =>
      await new Promise<string | null>((resolve) => {
        const amd = (
          window as unknown as { require?: (deps: string[], ok: (k: unknown) => void, fail?: () => void) => void }
        ).require;

        if (typeof amd !== 'function') {
          return resolve(null);
        }

        setTimeout(() => resolve(null), 5_000);
        amd(
          ['esri/kernel'],
          (kernel) => resolve((kernel as { version?: string }).version ?? null),
          () => resolve(null)
        );
      })
  );
}

/** Zoom to 2 decimal places, center to 5 (about a metre): finer than that is animation noise. */
export function roundFraming(framing: Framing): Framing {
  const round = (value: number, places: number) => Number(value.toFixed(places));

  return { zoom: round(framing.zoom, 2), center: [round(framing.center[0], 5), round(framing.center[1], 5)] };
}

export interface SettledFraming {
  framing: Framing | null;
  /** False when it was still changing when the wait gave up; `framing` is then the last reading. */
  settled: boolean;
}

/**
 * Waits for the map to load, then for its framing to stop moving, and returns it rounded.
 *
 * "Loaded" is the probe's `ready`: every layer settled. Framing is not final then - a `goTo` animates
 * for about half a second after the view becomes ready, and a map can frame itself later still - so it
 * is read every 250 ms until it has not changed for a second, for up to 30 seconds.
 *
 * Until #1426 it was read once a second until three readings agreed, which spent at least two seconds of
 * every test asleep however early the map had stopped. A second unchanged is still twice the length of a
 * `goTo`, and readings four times as frequent see a move that the old ones could have slept through.
 *
 * Throws if the map never becomes ready, which is a broken map, not a framing difference.
 */
export async function waitForSettledFraming(page: Page, route: string): Promise<SettledFraming> {
  await page
    .waitForFunction(
      (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
      PROBE_GLOBAL,
      { timeout: 90_000, polling: POLL_MS }
    )
    .catch(() => {
      throw new Error(`${route} never finished loading, so where it opens could not be read`);
    });

  const key = (framing: Framing | null) => JSON.stringify(framing && roundFraming(framing));
  const deadline = Date.now() + SETTLE_TIMEOUT_MS;
  let last: Framing | null = null;
  let lastKey: string | null = null;
  let unchangedSince = 0;

  for (;;) {
    last = await readFraming(page);
    const now = Date.now();
    const reading = key(last);

    if (reading !== lastKey) {
      lastKey = reading;
      unchangedSince = now;
    } else if (now - unchangedSince >= SETTLED_FOR_MS) {
      return { framing: last && roundFraming(last), settled: true };
    }

    if (now >= deadline) {
      break;
    }

    await page.waitForTimeout(POLL_MS);
  }

  return { framing: last && roundFraming(last), settled: false };
}
