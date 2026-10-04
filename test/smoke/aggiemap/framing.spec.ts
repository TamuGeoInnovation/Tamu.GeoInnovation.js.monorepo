import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { blockAnalytics } from './analytics';
import { Framing, readEsriVersion, waitForSettledFraming } from './framing';
import { MANIFEST_PATH, MapManifest } from './global-setup';

/**
 * Every map opens where it opens on production (#1380).
 *
 * #1379 was found by eye: after ArcGIS 4.23 -> 4.27, every event map framed by its builder choice
 * opened at the default campus zoom on dev, while every layer still loaded and drew, so the rest of
 * this suite passed. Nothing compared where a map *opens*. This does, against a baseline captured from
 * production: `framing-baseline.json`, one `{ zoom, center }` per route at the suite's viewport.
 *
 * **Routes** are every map the environment lists (the manifest `global-setup.ts` writes) plus every
 * builder destination recorded in `tools/builder-inventory`, by its direct link, so per-choice framing
 * - Ring Day days, Fish Camp sessions, Move-In halls - is covered without a hand-written list. A map
 * behind a builder is checked through its destinations, not its own route, which only redirects into
 * the builder. A destination whose map this environment does not list is left out.
 *
 * **Compared** to within 0.05 zoom and 0.0001 degrees (about ten metres): a `goTo` lands exactly, and
 * the failures this exists for are hundreds of metres or a whole zoom level out. A route missing from
 * the baseline, or in the baseline but not served here, is reported in the run's output and
 * annotations, not failed: the two environments legitimately list different maps.
 *
 * **Refresh** with `UPDATE_FRAMING_BASELINE=1 test/smoke/aggiemap/run-local.sh production`. Each test
 * then writes its own route into the baseline instead of comparing. Tests run in parallel workers,
 * which are separate processes, so each write is a read-modify-write of the whole file under a lock (a
 * directory beside it: `mkdir` either creates it or fails, atomically). Every write also drops routes
 * that are no longer in the run's list, so a full refresh leaves exactly what production serves. A
 * route that fails to capture keeps its old entry and fails its test, so a partial refresh is visible.
 * Review the diff: a changed entry is a deliberate framing change or a production regression.
 *
 * **The baseline must come from production**, the known-good reference: captured anywhere else it would
 * record the build under test. Update mode refuses any other environment.
 */

const BASELINE_PATH = path.join(__dirname, 'framing-baseline.json');
const LOCK_PATH = `${BASELINE_PATH}.lock`;
const INVENTORY_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'tools',
  'builder-inventory',
  'builder-inventory.generated.json'
);

const PRODUCTION = 'https://aggiemap.tamu.edu';
const UPDATE = process.env.UPDATE_FRAMING_BASELINE === '1';

const ZOOM_TOLERANCE = 0.05;
const CENTER_TOLERANCE_DEGREES = 0.0001;

interface FramingBaseline {
  capturedFrom: string;
  capturedAt: string;
  viewport: { width: number; height: number } | null;
  esriVersion: string | null;
  routes: Record<string, Framing>;
}

interface BuilderInventory {
  maps: { route: string; destinations: { shareTarget: string }[] }[];
}

const manifest: MapManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Read regardless of the environment the inventory was captured on: its destinations are root-relative
// links, and the manifest decides below which of them this environment serves.
const inventory: BuilderInventory = fs.existsSync(INVENTORY_PATH)
  ? JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'))
  : { maps: [] };

const listed = new Set(manifest.maps);
const builderMaps = new Set(inventory.maps.map((map) => map.route));

const routes = [
  ...new Set([
    ...manifest.maps.filter((route) => !builderMaps.has(route)),
    ...inventory.maps
      .filter((map) => listed.has(map.route))
      .flatMap((map) => map.destinations.map((destination) => destination.shareTarget))
  ])
].sort();

function readBaseline(): FramingBaseline | null {
  return fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')) : null;
}

const baseline = readBaseline();

/** Runs `write` with the baseline file to itself; see the doc comment above for why. */
async function underLock(write: () => void): Promise<void> {
  for (let waited = 0; ; waited += 100) {
    try {
      fs.mkdirSync(LOCK_PATH);
      break;
    } catch {
      // A lock older than any write could take was left by a killed run.
      const lockedAt = fs.statSync(LOCK_PATH, { throwIfNoEntry: false })?.mtimeMs ?? Date.now();

      if (Date.now() - lockedAt > 10_000) {
        fs.rmSync(LOCK_PATH, { recursive: true, force: true });
      } else if (waited > 60_000) {
        throw new Error(`could not lock ${BASELINE_PATH}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  try {
    write();
  } finally {
    fs.rmSync(LOCK_PATH, { recursive: true, force: true });
  }
}

/** One line per route, so a framing change is a one-line diff. */
function formatBaseline(baseline: FramingBaseline): string {
  const { routes: entries, ...metadata } = baseline;
  const lines = Object.entries(entries).map(
    ([route, framing]) => `    ${JSON.stringify(route)}: ${JSON.stringify(framing)}`
  );

  return `${JSON.stringify(metadata, null, 2).replace(/\n}$/, '')},\n  "routes": {\n${lines.join(',\n')}\n  }\n}\n`;
}

const framingText = (framing: Framing) => `zoom ${framing.zoom} centered on ${framing.center.join(', ')}`;

test.describe('every map opens where it does on production', () => {
  test('the baseline and this environment cover the same routes', () => {
    test.skip(UPDATE || baseline === null, 'nothing to compare against');

    const baselineRoutes = baseline?.routes ?? {};
    const notServed = Object.keys(baselineRoutes).filter((route) => !routes.includes(route));
    const notInBaseline = routes.filter((route) => !(route in baselineRoutes));

    // Reported, not failed: production does not list dev's development-only maps, and an event is
    // added to one environment before the other.
    for (const [type, list] of [
      ['in the baseline, not served here', notServed],
      ['served here, not in the baseline', notInBaseline]
    ] as const) {
      if (list.length > 0) {
        test.info().annotations.push({ type, description: list.join('\n') });
        console.log(`[framing] ${list.length} route(s) ${type}:\n  ${list.join('\n  ')}`);
      }
    }
  });

  for (const route of routes) {
    test(`${route} opens where it does on production`, async ({ page, baseURL }) => {
      const expected = baseline?.routes[route];

      test.skip(!UPDATE && !expected, `${route} is not in framing-baseline.json, so there is nothing to compare`);

      if (UPDATE) {
        expect(baseURL, 'the framing baseline must be captured from production').toBe(PRODUCTION);
      }

      await blockAnalytics(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // A listed map behind a builder with no recorded destination never creates a view. There is no
      // URL that reaches it; re-running tools/builder-inventory is what covers it.
      const probePresent = await page
        .waitForFunction(
          (name) => (window as unknown as Record<string, unknown>)[name] !== undefined,
          '__tamuGiscMapProbe',
          {
            timeout: 30_000,
            polling: 500
          }
        )
        .then(() => true)
        .catch(() => false);

      test.skip(
        !probePresent && page.url().includes('/builder/'),
        `${route} is gated behind a builder with no recorded destination`
      );

      const { framing, settled } = await waitForSettledFraming(page, route);

      if (framing === null) {
        throw new Error(`${route} has no map view, so where it opens could not be read`);
      }

      if (!settled) {
        test.info().annotations.push({
          type: 'unsettled',
          description: `still moving after 30 s; last read ${framingText(framing)}`
        });
      }

      if (UPDATE) {
        expect(settled, `${route} was still moving after 30 s, so it has no single framing to record`).toBe(true);

        const esriVersion = await readEsriVersion(page);
        const viewport = test.info().project.use.viewport ?? null;

        await underLock(() => {
          const current = readBaseline();
          const kept = Object.entries({ ...current?.routes, [route]: framing }).filter(([r]) => routes.includes(r));
          const next: FramingBaseline = {
            capturedFrom: PRODUCTION,
            capturedAt: new Date().toISOString(),
            viewport,
            esriVersion: esriVersion ?? current?.esriVersion ?? null,
            routes: Object.fromEntries(kept.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
          };

          fs.writeFileSync(BASELINE_PATH, formatBaseline(next));
        });

        return;
      }

      if (!expected || !baseline) {
        return;
      }

      const lands =
        Math.abs(framing.zoom - expected.zoom) <= ZOOM_TOLERANCE &&
        Math.abs(framing.center[0] - expected.center[0]) <= CENTER_TOLERANCE_DEGREES &&
        Math.abs(framing.center[1] - expected.center[1]) <= CENTER_TOLERANCE_DEGREES;

      expect(
        lands,
        `${route} opened at ${framingText(framing)}; on production (${baseline.capturedFrom}, ${baseline.capturedAt}) ` +
          `it opens at ${framingText(expected)}`
      ).toBe(true);
    });
  }
});
