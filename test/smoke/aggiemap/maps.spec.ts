import { expect, test } from '@playwright/test';
import * as fs from 'fs';

import { APP_ROOT, MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';

/**
 * Behaviours 1 and 2 of #1034, for every map the target environment lists.
 *
 * 1. The map loads -- served, Angular bootstraps, no uncaught errors, no server errors.
 * 2. Every layer resolves -- on the map, loaded without error, and the map is serving features.
 *
 * One test per map, generated from the manifest `global-setup.ts` writes. A new event map is
 * covered the moment it appears on a discovery page; nobody adds a test.
 *
 * Read-only throughout, so this is safe to point at production.
 */

/**
 * Lowest number of maps a healthy environment should list.
 *
 * Production discovered 61 on 27 Sep 2026 and development discovers more, since it also lists the
 * kiosk and satellite-campus sections. The floor exists so that a discovery page breaking -- which
 * would otherwise quietly shrink this suite to a handful of tests and still report all green --
 * fails instead. Override per environment with AGGIEMAP_SMOKE_MIN_MAPS.
 */
const MIN_MAPS = Number(process.env.AGGIEMAP_SMOKE_MIN_MAPS ?? 55);

/**
 * Layers whose load failure is expected in the target environment, by title or id.
 *
 * The two environments legitimately differ, and so does a local run, so a single strict expectation
 * cannot fit all three:
 *
 * - **Production**: `TS/Bus_Routes` is not published, so the bus layers fail there and not on dev.
 * - **Development**: the development GIS server does not host every service production does.
 * - **A local run**: `Dining Locations` is fetched from `api.aggiemap.tamu.edu`, whose CORS
 *   allowlist names specific origins. `127.0.0.1:4200` is on it; the address a container reaches the
 *   host on is not, so the browser blocks it and the layer fails for a reason that has nothing to do
 *   with the map.
 *
 * Tolerated failures are still reported in the test's annotations, so an entry here suppresses a
 * failure without hiding it. Keep the list short and justified -- it is the one place this suite can
 * quietly lose coverage.
 */
const ALLOWED_LAYER_FAILURES = (process.env.AGGIEMAP_SMOKE_ALLOWED_LAYER_FAILURES ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

/**
 * The probe's shape, redeclared rather than imported from `@tamu-gisc/maps/esri`.
 *
 * Importing the library barrel would pull the Angular dependency graph into this process, which
 * does not load outside a bundler.
 *
 * The global's name below is therefore duplicated from `MAP_PROBE_GLOBAL` in
 * `libs/maps/esri/src/lib/services/map/map-probe.ts`. `map-probe.spec.ts` pins that constant to
 * this literal, so renaming it there fails a unit test that points back here rather than silently
 * turning every map test red.
 */
interface ProbeLayer {
  id: string;
  title: string;
  type: string;
  visible: boolean;
  loaded: boolean;
  error: string | null;
  featureCount: number | null;
}

interface ProbeSnapshot {
  ready: boolean;
  viewReady: boolean;
  layers: ProbeLayer[];
}

const PROBE_GLOBAL = '__tamuGiscMapProbe';

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

test.describe('discovery', () => {
  test(`lists at least ${MIN_MAPS} maps`, () => {
    expect(
      manifest.maps.length,
      `discovered ${manifest.maps.length} maps on ${manifest.baseUrl}; a drop this large usually ` +
        `means a discovery page stopped rendering its list rather than that maps were removed`
    ).toBeGreaterThanOrEqual(MIN_MAPS);
  });
});

for (const mapPath of manifest.maps) {
  test(`${mapPath} loads and serves its layers`, async ({ page }) => {
    // This suite loads every map on a schedule. Left unblocked that is synthetic traffic in the
    // analytics property every day, indistinguishable from real visitors. `analytics.spec.ts` is the
    // one place that deliberately lets the requests through, and asserts on them.
    await blockAnalytics(page);

    const pageErrors: string[] = [];
    const serverErrors: string[] = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Behaviour 1: the document is served and the application starts.
    const response = await page.goto(mapPath);

    expect(response?.status(), `${mapPath} did not return 200`).toBe(200);

    // Polls until Angular renders into the root. Asserting the root is merely attached would pass
    // instantly, because it ships in index.html -- that proves the shell was served, not that the
    // app booted.
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();

    // Behaviour 2: the map itself comes up. Esri needs tens of seconds on a cold load, hence the
    // long poll rather than the default expect timeout.
    await expect
      .poll(async () => await page.evaluate(
          (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
          PROBE_GLOBAL
        ), {
        message: `the layers on ${mapPath} never finished loading`,
        timeout: 90_000,
        intervals: [1_000]
      })
      .toBe(true);

    const snapshot: ProbeSnapshot = await page.evaluate(
      async (name) =>
        await (window as unknown as Record<string, { snapshot: () => Promise<ProbeSnapshot> }>)[name].snapshot(),
      PROBE_GLOBAL
    );

    // Recorded on every run, pass or fail. This is the raw material for a stricter per-layer
    // expectation later -- guessing which layers should be non-empty would build in exactly the
    // false alarms this suite cannot afford.
    test.info().annotations.push({
      type: 'layers',
      description: `viewReady=${snapshot.viewReady}
` + snapshot.layers
        .map((l) => `${l.title || l.id} [${l.type}] loaded=${l.loaded} count=${l.featureCount ?? 'n/a'}`)
        .join('\n')
    });

    expect(snapshot.layers.length, `${mapPath} has no layers at all`).toBeGreaterThan(0);

    const failed = snapshot.layers.filter((l) => l.error !== null);
    const tolerated = failed.filter(
      (l) => ALLOWED_LAYER_FAILURES.includes(l.title) || ALLOWED_LAYER_FAILURES.includes(l.id)
    );

    if (tolerated.length > 0) {
      test.info().annotations.push({
        type: 'tolerated layer failures',
        description: tolerated.map((l) => `${l.title || l.id}: ${l.error}`).join('\n')
      });
    }

    expect(
      failed.filter((l) => !tolerated.includes(l)).map((l) => `${l.title || l.id}: ${l.error}`),
      `layers failed to load on ${mapPath}`
    ).toEqual([]);

    // Deliberately "at least one", not "every queryable layer". Some layers are legitimately empty
    // -- an event layer outside its event, for one -- so requiring all of them to be non-empty
    // would fail healthy maps. This catches the case that matters: a map serving nothing at all.
    const withFeatures = snapshot.layers.filter((l) => (l.featureCount ?? 0) > 0);

    expect(
      withFeatures.length,
      `no layer on ${mapPath} returned any features, so the map is drawing nothing`
    ).toBeGreaterThan(0);

    // Checked last so a bootstrap failure is reported as a map that never became ready, rather than
    // as an incidental console error.
    expect(pageErrors, `uncaught errors on ${mapPath}`).toEqual([]);
    expect(serverErrors, `server errors on ${mapPath}`).toEqual([]);
  });
}
