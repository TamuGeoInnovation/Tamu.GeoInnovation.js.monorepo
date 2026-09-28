import { Browser, Page, chromium, expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Records where every builder selection takes a visitor, and the share URL of the map it lands on.
 *
 * ---
 *
 * Why this exists
 *
 * Eleven maps are not reachable by URL. `/events/:eventId` redirects to `builder/accommodations`,
 * and `/events/:eventId/map` redirects straight back until a selection has been made, so the smoke
 * suite times out on them: no map is ever created.
 *
 * The map does expose a share URL that encodes the chosen settings
 * (`location.pathname + '?' + queryParamsFromSettings`). Captured once, those URLs are stable
 * targets the smoke suite can load directly, without driving the builder every run.
 *
 * So this is a generator, not a test. It lives outside `test/smoke` so the scheduled runs never
 * execute it, and it is run by hand when the builders change.
 *
 * How it walks
 *
 * Breadth-first over *prefixes* of choices. A queue item is a list of option indices; a fresh browser
 * context replays it, and on reaching a step the prefix does not cover, the options on the page are
 * counted and one child prefix is enqueued per option. A prefix that covers every step continues
 * through review to the map and yields a destination.
 *
 * That costs one page load per node of the choice tree rather than re-walking from the top for every
 * leaf, and it discovers each step's options **from the page**. The option counts are deliberately
 * not computed from the definition files: later steps can depend on earlier choices, and the point of
 * a baseline is to record what the application actually does.
 *
 * Settings are held per browser context, so each walk gets its own and they can run concurrently.
 *
 * Results are written after every destination, not at the end. The full run takes tens of minutes,
 * and a crash partway through should leave behind everything gathered so far.
 */

const BASE_URL = (process.env.AGGIEMAP_SMOKE_BASE_URL ?? 'https://aggiemap.tamu.edu').replace(/\/$/, '');

/** Restrict to specific routes while iterating, e.g. `/events/graduation-fall,/parking/move-in`. */
const ONLY = (process.env.BUILDER_INVENTORY_ONLY ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

/** Concurrent walks. Each holds a browser context and loads an Esri map, so this is memory-bound. */
const CONCURRENCY = Number(process.env.BUILDER_INVENTORY_CONCURRENCY ?? 4);

/** Safety stop, so an unexpectedly wide builder cannot run indefinitely. */
const MAX_DESTINATIONS_PER_MAP = Number(process.env.BUILDER_INVENTORY_MAX ?? 600);

const OUT_DIR = __dirname;
const JSON_PATH = path.join(OUT_DIR, 'builder-inventory.generated.json');
const MARKDOWN_PATH = path.join(OUT_DIR, 'BUILDER-INVENTORY.md');

/** Every clickable option in the builder carries `tabindex="0"`, across all four of its UI types. */
const OPTION = '.container12 [tabindex="0"]';

/**
 * The review step's control. `tamu-gisc-button` renders `<input type="button" [value]="value">`, so
 * the label is an attribute and not text content -- `getByText` never matches it.
 */
const TAKE_ME_TO_MY_MAP = 'input[value="Take Me To My Map"]';

const PROBE_GLOBAL = '__tamuGiscMapProbe';

const ACTION_TIMEOUT = 30_000;

interface StepTaken {
  /** Accommodation key, from the route (`.../accommodations/date` -> `date`). */
  step: string;
  chosenLabel: string;
  chosenIndex: number;
  /** Every label offered at this step, so a removed or renamed choice is visible in a diff. */
  offered: string[];
}

interface Destination {
  stepsTaken: StepTaken[];
  /** The copy-link exactly as the map offers it, origin included. */
  shareUrl: string | null;

  /**
   * The same target as a path and query, without the origin.
   *
   * This is the portable form, and the one the smoke suite should consume: a list captured against
   * one environment is then replayable against another. `shareUrl` is kept verbatim because it is
   * what a person actually copies out of the page.
   */
  shareTarget: string | null;

  landedAt: string;
  layerCount: number;
  layersWithFeatures: number;
  layerFailures: string[];
  /** Layer titles, sorted -- the baseline for "does this destination still draw the right layers". */
  layers: string[];
  error?: string;
}

interface MapInventory {
  route: string;
  destinations: Destination[];
  truncated: boolean;
  error?: string;
}

const inventory: MapInventory[] = [];

test('capture builder destinations', async () => {
  test.setTimeout(6 * 60 * 60 * 1000);

  const browser = await chromium.launch();

  try {
    const routes = await routesToInventory(browser);

    console.log(`[inventory] walking ${routes.length} builder-gated maps with concurrency ${CONCURRENCY}`);

    for (const route of routes) {
      const entry: MapInventory = { route, destinations: [], truncated: false };

      inventory.push(entry);

      try {
        await walkAll(browser, entry);
      } catch (error) {
        entry.error = describe(error);
      }

      console.log(`[inventory] ${route}: ${entry.destinations.length} destination(s)${entry.truncated ? ' (truncated)' : ''}`);
      persist();
    }
  } finally {
    await browser.close();
  }

  persist();

  const captured = inventory.reduce((total, m) => total + m.destinations.filter((d) => d.shareUrl).length, 0);

  console.log(`[inventory] ${inventory.length} builders, ${captured} destination URLs captured`);

  // Capturing nothing means the walk is broken, not that there is nothing to capture.
  expect(captured, 'no destination share URLs were captured').toBeGreaterThan(0);
});

/** Writes both artifacts. Called after every map so progress is visible during a long run. */
function persist(): void {
  const payload = {
    baseUrl: BASE_URL,
    capturedAt: new Date().toISOString(),
    maps: inventory
  };

  fs.writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(MARKDOWN_PATH, renderMarkdown(inventory));
}

/**
 * The routes to walk: those the smoke manifest found, filtered to the ones that actually redirect
 * into a builder. Detected rather than listed, so a map that gains or loses a builder is picked up.
 */
async function routesToInventory(browser: Browser): Promise<string[]> {
  if (ONLY.length > 0) {
    return ONLY;
  }

  const manifestPath = path.join(__dirname, '..', '..', 'test', 'smoke', 'aggiemap', 'map-manifest.generated.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `No map manifest at ${manifestPath}. Run the smoke suite once against this environment first ` +
        `(its global setup writes the manifest), or set BUILDER_INVENTORY_ONLY.`
    );
  }

  const manifest: { maps: string[] } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const builderRoutes: string[] = [];

  await inParallel(manifest.maps, CONCURRENCY, async (route) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    page.setDefaultTimeout(ACTION_TIMEOUT);

    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      // The redirect into the builder happens client-side, after load. Waiting for the route to
      // resolve rather than pausing a fixed interval, which under-waits on a slow load and wastes
      // time on every fast one.
      await settle(page);

      if (page.url().includes('/builder/')) {
        builderRoutes.push(route);
      }
    } catch {
      // A route that will not even load is reported by the smoke suite; it is not this tool's job.
    } finally {
      await context.close();
    }
  });

  builderRoutes.sort();

  console.log(`[inventory] ${builderRoutes.length} of ${manifest.maps.length} maps are builder-gated`);

  return builderRoutes;
}

/**
 * Breadth-first walk of one builder's whole choice tree.
 *
 * The frontier holds prefixes still to explore. Exploring a prefix either widens the frontier (the
 * next step's options) or produces a destination.
 */
async function walkAll(browser: Browser, entry: MapInventory): Promise<void> {
  let frontier: number[][] = [[]];

  while (frontier.length > 0) {
    if (entry.destinations.length >= MAX_DESTINATIONS_PER_MAP) {
      entry.truncated = true;
      return;
    }

    const next: number[][] = [];

    await inParallel(frontier, CONCURRENCY, async (prefix) => {
      const outcome = await explore(browser, entry.route, prefix);

      if (outcome.kind === 'branch') {
        for (let index = 0; index < outcome.options; index += 1) {
          next.push([...prefix, index]);
        }
      } else {
        entry.destinations.push(outcome.destination);
        persist();
      }
    });

    frontier = next;
  }
}

type Outcome = { kind: 'branch'; options: number } | { kind: 'destination'; destination: Destination };

/**
 * Replays `prefix`, then either counts the options at the first uncovered step (a branch) or, if the
 * prefix covers every step, continues through review to the map (a destination).
 */
async function explore(browser: Browser, route: string, prefix: number[]): Promise<Outcome> {
  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(ACTION_TIMEOUT);

  const stepsTaken: StepTaken[] = [];

  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await settle(page);

    let guard = 0;

    while (guard < 12) {
      guard += 1;

      const url = page.url();

      if (url.includes('/builder/accommodations')) {
        await page.waitForSelector(OPTION, { timeout: 60_000 });

        const options = page.locator(OPTION);
        const count = await options.count();

        // Beyond the prefix: report how wide this step is and stop. The caller enqueues the children.
        if (stepsTaken.length >= prefix.length) {
          return { kind: 'branch', options: count };
        }

        const index = prefix[stepsTaken.length];
        const offered = (await options.allInnerTexts()).map((text) => text.replace(/\s+/g, ' ').trim());

        stepsTaken.push({
          step: url.split('/accommodations/')[1]?.split(/[?#]/)[0] ?? '(unnamed)',
          chosenLabel: offered[index] ?? `(index ${index})`,
          chosenIndex: index,
          offered
        });

        await clickOption(page, index);
        continue;
      }

      if (url.includes('/builder/review')) {
        await page.locator(TAKE_ME_TO_MY_MAP).first().click({ timeout: ACTION_TIMEOUT });
        await page
          .waitForFunction((previous) => window.location.href !== previous, url, { timeout: ACTION_TIMEOUT })
          .catch(() => undefined);
        continue;
      }

      break;
    }

    return { kind: 'destination', destination: await readDestination(page, stepsTaken) };
  } catch (error) {
    return {
      kind: 'destination',
      destination: {
        stepsTaken,
        shareUrl: null,
        shareTarget: null,
        landedAt: safeUrl(page),
        layerCount: 0,
        layersWithFeatures: 0,
        layerFailures: [],
        layers: [],
        error: describe(error)
      }
    };
  } finally {
    await context.close();
  }
}

/**
 * Waits until the route has resolved to a builder step or a map.
 *
 * `/events/:eventId` redirects into the builder client-side, which happens *after*
 * `domcontentloaded`. Without this wait the walk reads the bare route, matches neither the
 * accommodations nor the review branch, and falls straight through to "destination" -- recording a
 * row with no steps taken and no share URL. That is exactly what the first run produced.
 */
async function settle(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () => /\/builder\/(intro|accommodations|review)|\/map(\/|$)/.test(window.location.pathname),
      undefined,
      { timeout: 60_000, polling: 250 }
    )
    .catch(() => undefined);
}

async function clickOption(page: Page, index: number): Promise<void> {
  const before = page.url();

  await page.locator(OPTION).nth(index).click({ timeout: ACTION_TIMEOUT });

  // Selecting an option navigates (to the next accommodation, or to review). Waiting on the URL is
  // more reliable than a fixed pause, which either flakes or wastes time on every step.
  await page
    .waitForFunction((previous) => window.location.href !== previous, before, { timeout: ACTION_TIMEOUT })
    .catch(() => undefined);
}

async function readDestination(page: Page, stepsTaken: StepTaken[]): Promise<Destination> {
  await page
    .waitForFunction(
      (name) => (window as unknown as Record<string, { ready?: boolean }>)[name]?.ready === true,
      PROBE_GLOBAL,
      { timeout: 120_000, polling: 1_000 }
    )
    .catch(() => undefined);

  const snapshot = await page
    .evaluate(
      async (name) =>
        await (
          window as unknown as Record<
            string,
            { snapshot: () => Promise<{ layers: { title: string; id: string; error: string | null; featureCount: number | null }[] }> }
          >
        )[name]?.snapshot(),
      PROBE_GLOBAL
    )
    .catch(() => undefined);

  const layers = snapshot?.layers ?? [];

  const shareUrl = await page
    .locator('.copy-element .copy-text')
    .first()
    .innerText({ timeout: ACTION_TIMEOUT })
    .then((text) => text.trim())
    .catch(() => null);

  const captured = shareUrl && shareUrl.length > 0 ? shareUrl : null;

  return {
    stepsTaken,
    shareUrl: captured,
    shareTarget: toTarget(captured),
    landedAt: safeUrl(page),
    layerCount: layers.length,
    layersWithFeatures: layers.filter((l) => (l.featureCount ?? 0) > 0).length,
    layerFailures: layers.filter((l) => l.error !== null).map((l) => `${l.title || l.id}: ${l.error}`),
    layers: layers.map((l) => l.title || l.id).sort()
  };
}

/** Runs `worker` over `items`, at most `limit` at a time. */
async function inParallel<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(limit, queue.length)) }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
        await worker(item);
      }
    })
  );
}

/** Strips the origin from a captured share URL, leaving a target portable across environments. */
function toTarget(shareUrl: string | null): string | null {
  if (shareUrl === null) {
    return null;
  }

  try {
    const url = new URL(shareUrl);

    return url.pathname + url.search;
  } catch {
    // Already relative, or not a URL at all -- keep whatever the page offered.
    return shareUrl;
  }
}

function safeUrl(page: Page): string {
  try {
    const url = new URL(page.url());

    return url.pathname + url.search;
  } catch {
    return '(unknown)';
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message.split('\n')[0] : String(error);
}

function renderMarkdown(maps: MapInventory[]): string {
  const lines: string[] = [
    '# Builder destination inventory',
    '',
    'Generated by `tools/builder-inventory`. Each row is one path through a builder and the map it',
    'lands on. The share URL is the re-runnable target: it encodes the chosen settings, so it reaches',
    'the destination without walking the builder.',
    '',
    `Captured against \`${BASE_URL}\`.`,
    '',
    'Every combination of every step is walked. `offered` in the JSON records all choices presented at',
    'each step, so a renamed or removed option shows up as a diff rather than as a silent change.',
    ''
  ];

  for (const map of maps) {
    lines.push(`## \`${map.route}\``, '');

    if (map.error) {
      lines.push(`**Could not be walked:** ${map.error}`, '');
      continue;
    }

    const captured = map.destinations.filter((d) => d.shareUrl).length;

    lines.push(
      `${map.destinations.length} path(s), ${captured} with a share URL${map.truncated ? ' — **truncated by the safety cap**' : ''}.`,
      '',
      '| Selection | Share URL | Layers | With features | Failures |',
      '| --- | --- | --- | --- | --- |'
    );

    for (const destination of map.destinations) {
      const selection = destination.stepsTaken.map((s) => `${s.step}: ${s.chosenLabel}`).join(' → ') || '(none)';
      const failures = destination.error
        ? `**${destination.error}**`
        : destination.layerFailures.length > 0
        ? destination.layerFailures.join('; ')
        : '—';

      const target = destination.shareTarget ?? destination.shareUrl;

      lines.push(
        `| ${selection} | ${target ? `\`${target}\`` : '**not captured**'} | ${destination.layerCount} | ${destination.layersWithFeatures} | ${failures} |`
      );
    }

    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
