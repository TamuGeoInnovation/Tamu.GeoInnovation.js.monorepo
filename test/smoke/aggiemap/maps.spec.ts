import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { APP_ROOT, MANIFEST_PATH, MapManifest } from './global-setup';
import { blockAnalytics } from './analytics';
import { directionsAvailable, directionsEntryPoints } from './directions';

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

  /** Diagnostics only. Never compare this to the view's - see the drawable check below. */
  spatialReference?: number | null;

  /** Absent on builds older than this field; see the drawable check below. */
  drawable?: boolean | null;
}

interface ProbeSnapshot {
  ready: boolean;
  viewReady: boolean;

  /** Absent on builds older than this field; see the drawable check below. */
  spatialReference?: number | null;

  layers: ProbeLayer[];
}

const PROBE_GLOBAL = '__tamuGiscMapProbe';

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

/**
 * Builder destinations, so the maps behind a builder are tested rather than skipped.
 *
 * Eleven maps cannot be reached by URL: `/events/:eventId` redirects into a builder and
 * `/events/:eventId/map` redirects back until a selection is made. `tools/builder-inventory` walks
 * those builders and records a share URL for every combination. Until now nothing read the file, so
 * those maps were skipped on every run and their layers were never checked. See #1088.
 *
 * **One representative per distinct layer set, not one per destination.** The inventory holds 360
 * destinations across 11 maps, and they collapse to 11 distinct layer sets - `/parking/move-in` alone
 * has 324 destinations that all land on the same page with the same layers, differing only in the
 * query string. Testing all of them would add hours to a nightly run to ask the same question 324
 * times. Grouping by layer signature rather than taking the first means a builder that ever does
 * produce a genuinely different layer set gets covered without anyone noticing it needs to be.
 *
 * The visual suites cannot use this shortcut: the choices change which features are drawn, so those
 * destinations are genuinely different pictures even when the layer set matches. See #1089.
 */
interface InventoryDestination {
  shareTarget: string;
  landedAt: string;
  layers?: string[];
  stepsTaken?: { step: string; chosenLabel: string }[];
}

interface InventoryMap {
  route: string;
  destinations: InventoryDestination[];
}

interface BuilderInventory {
  baseUrl: string;
  capturedAt: string;
  maps: InventoryMap[];
}

const INVENTORY_PATH = path.join(__dirname, '..', '..', '..', 'tools', 'builder-inventory', 'builder-inventory.generated.json');

function loadBuilderTargets(): Map<string, { target: string; label: string }[]> {
  const byRoute = new Map<string, { target: string; label: string }[]>();

  if (!fs.existsSync(INVENTORY_PATH)) {
    return byRoute;
  }

  const inventory: BuilderInventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));

  // An inventory captured against a different environment describes a different site. Using one
  // anyway is how the committed file came to describe production while being read as dev's: it was
  // crawled at `127.0.0.1`, which `TestingService` treats as production because the host contains
  // neither `dev` nor `localhost`.
  if (inventory.baseUrl !== manifest.baseUrl) {
    console.warn(
      `[smoke] builder inventory was captured against ${inventory.baseUrl} but this run targets ` +
        `${manifest.baseUrl}; ignoring it, so builder-gated maps will be skipped. Re-run ` +
        `tools/builder-inventory against this environment.`
    );

    return byRoute;
  }

  for (const map of inventory.maps) {
    const seen = new Set<string>();
    const picked: { target: string; label: string }[] = [];

    for (const destination of map.destinations) {
      const signature = [...(destination.layers ?? [])].sort().join('|');

      if (seen.has(signature)) {
        continue;
      }

      seen.add(signature);
      picked.push({
        target: destination.shareTarget,
        label: (destination.stepsTaken ?? []).map((s) => s.chosenLabel).join(' / ') || 'default'
      });
    }

    if (picked.length > 0) {
      byRoute.set(map.route, picked);
    }
  }

  return byRoute;
}

const builderTargets = loadBuilderTargets();

test.describe('discovery', () => {
  test(`lists at least ${MIN_MAPS} maps`, () => {
    expect(
      manifest.maps.length,
      `discovered ${manifest.maps.length} maps on ${manifest.baseUrl}; a drop this large usually ` +
        `means a discovery page stopped rendering its list rather than that maps were removed`
    ).toBeGreaterThanOrEqual(MIN_MAPS);
  });
});

/**
 * One case per map, except for the maps behind a builder, which get one per distinct layer set.
 *
 * `loadPath` is what the test actually navigates to: the map's own route normally, or a recorded
 * builder destination for a map that has no reachable URL of its own.
 */
const cases: { mapPath: string; loadPath: string; title: string }[] = [];

for (const mapPath of manifest.maps) {
  const targets = builderTargets.get(mapPath);

  if (!targets || targets.length === 0) {
    cases.push({ mapPath, loadPath: mapPath, title: `${mapPath} loads and serves its layers` });
    continue;
  }

  for (const { target, label } of targets) {
    cases.push({
      mapPath,
      loadPath: target,
      title: `${mapPath} (${label}) loads and serves its layers`
    });
  }
}

for (const { mapPath, loadPath, title } of cases) {
  test(title, async ({ page }) => {
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
    const response = await page.goto(loadPath);

    expect(response?.status(), `${mapPath} did not return 200`).toBe(200);

    // Polls until Angular renders into the root. Asserting the root is merely attached would pass
    // instantly, because it ships in index.html -- that proves the shell was served, not that the
    // app booted.
    await expect(page.locator(APP_ROOT)).not.toBeEmpty();

    // Is the probe there at all? Installed as soon as the map service is constructed, well before any
    // layer settles, so its absence means the deployed build predates it rather than that a map is
    // slow.
    //
    // Checked separately, and with a much shorter wait, because the two failures want different
    // answers: a missing probe is "deploy a newer build", a probe that never becomes ready is "a
    // layer is broken". Conflating them also made an environment without the probe take the full
    // poll on every map -- against production that was roughly 85 minutes of timeouts, which
    // exceeded the job timeout and cancelled the run instead of failing it, so the scheduled job
    // never reported anything.
    const probePresent = await page
      .waitForFunction((name) => (window as unknown as Record<string, unknown>)[name] !== undefined, PROBE_GLOBAL, {
        timeout: 30_000,
        polling: 500
      })
      .then(() => true)
      .catch(() => false);

    // A map that is gated behind a builder never creates a map view, so the probe never installs.
    // That is not the same as a build without the probe, and reporting it as one sends someone to
    // redeploy an environment that is working. `/events/:eventId` redirects into the builder, and
    // `/events/:eventId/map` redirects back until a selection has been made, so there is no URL that
    // reaches these maps -- which is what `tools/builder-inventory` exists to solve.
    //
    // Skipped rather than failed: the suite cannot reach these by design, and a nightly failure for
    // something no one intends to change is how a health label stops being read.
    const inBuilder = page.url().includes('/builder/');

    // Skipped only when there is nothing to load. A builder-gated map with a recorded destination is
    // navigated to directly and checked like any other, which is the whole point of #1088 - these were
    // skipped on every run and their layers were never looked at.
    test.skip(
      !probePresent && inBuilder && loadPath === mapPath,
      `${mapPath} is gated behind a builder and the inventory has no destination for it, so there is ` +
        `nothing to load. Re-run tools/builder-inventory against this environment.`
    );

    expect(
      probePresent,
      `${mapPath} has no map probe, so this build predates it. Nothing about the map's layers can be ` +
        `checked until a newer build is deployed here.`
    ).toBe(true);

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
      description: `viewReady=${snapshot.viewReady} viewSR=${snapshot.spatialReference ?? 'n/a'}
` + snapshot.layers
        .map((l) => `${l.title || l.id} [${l.type}] loaded=${l.loaded} count=${l.featureCount ?? 'n/a'}`)
        .join('\n')
    });

    expect(snapshot.layers.length, `${mapPath} has no layers at all`).toBeGreaterThan(0);

    // A map that loads everything and draws nothing.
    //
    // Esri reprojects feature data on request but never reprojects a tiled or vector tiled layer, so
    // one whose spatial reference differs from the view's is simply invisible: it loads, reports no
    // error, counts no features because it has none to count, and paints an empty canvas. Every
    // assertion above passes. That is exactly how every event and parking map went blank while this
    // suite reported them healthy (#1240).
    //
    // `drawable` is the probe's answer, not a comparison made here. The same spatial reference has
    // more than one number - Web Mercator is 102100 and 3857 - so comparing wkids reports every
    // healthy map as broken. Asking Esri's `SpatialReference.equals` is the only reliable form.
    //
    // Testing for `=== false` rather than falsiness also skips builds published before the probe
    // carried the field, the same way the bus checks skip a build without theirs: absent means "this
    // build cannot answer", not "the map is broken".
    const undrawable = snapshot.layers.filter((l) => l.visible && l.drawable === false);

    expect(
      undrawable.map((l) => `${l.title || l.id} [${l.type}] is ${l.spatialReference}`),
      `${mapPath} draws nothing: the view is ${snapshot.spatialReference} and these tiled layers cannot be reprojected into it`
    ).toEqual([]);

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

    // While routing is unavailable, no map may offer directions: no Directions tab, and no
    // "Directions To Here" left on the page (#1003). Whether a map offers them when routing is
    // available depends on its own configuration, so only the "hidden" case is checked per map.
    if (!directionsAvailable()) {
      expect(await directionsEntryPoints(page), `${mapPath} still offers directions`).toEqual({ tabs: 0, buttons: 0 });
    }

    // Checked last so a bootstrap failure is reported as a map that never became ready, rather than
    // as an incidental console error.
    expect(pageErrors, `uncaught errors on ${mapPath}`).toEqual([]);
    expect(serverErrors, `server errors on ${mapPath}`).toEqual([]);
  });
}
