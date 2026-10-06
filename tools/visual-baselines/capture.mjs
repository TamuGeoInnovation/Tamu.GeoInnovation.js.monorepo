/**
 * Captures a complete set of map screenshots for one environment (#1500).
 *
 * Every map AggieMap lists, plus every builder destination the inventory records, at two viewports,
 * written under a directory named for the environment and the build it ran against. A change like
 * #1497 - where the symbology of every drawn map may move at once - cannot be reviewed from two
 * screenshots. The only honest way to see what moved is a complete before and after.
 *
 *   node tools/visual-baselines/capture.mjs --env production --out /c/TAMU/visual-baselines
 *   node tools/visual-baselines/capture.mjs --env local --routes-only
 *
 * `--env` names an entry in test/smoke/aggiemap/environments.json, so the addresses and the
 * development/production gating are the same ones every other check reads. Nothing is hard-coded.
 *
 * The run **resumes**: a shot already on disk is skipped, so an interrupted crawl costs only what it
 * had not reached. That matters at this size - the first full builder crawl took two hours.
 *
 * Output:
 *   <out>/<env>/<build>/manifest.json      what ran, against what, when (US Central)
 *   <out>/<env>/<build>/desktop/<slug>.png
 *   <out>/<env>/<build>/phone/<slug>.png
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);

  return i === -1 ? fallback : process.argv[i + 1];
};

const flag = (name) => process.argv.includes('--' + name);

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const envName = arg('env', 'production');
const outRoot = arg('out', path.join(REPO, 'test', 'visual', 'baselines', 'environments'));
const routesOnly = flag('routes-only');
/** Comma-separated substrings; only routes containing one are captured. For asking a narrow question. */
const only = (arg('only', '') || '').split(',').map((part) => part.trim()).filter(Boolean);
const concurrency = Number(arg('concurrency', '3'));

const environments = JSON.parse(fs.readFileSync(path.join(REPO, 'test/smoke/aggiemap/environments.json'), 'utf8'));
const environment = environments[envName];

if (!environment) {
  console.error('Unknown environment "' + envName + '". Known: ' + Object.keys(environments).join(', '));
  process.exit(2);
}

const baseUrl = (process.env.AGGIEMAP_SMOKE_BASE_URL || environment.baseUrl).replace(/\/$/, '');

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 }
};

/** A file name that is stable, readable and safe, derived from the route it captures. */
const slugFor = (route) =>
  route
    .replace(/^\//, '')
    .replace(/[?&=]/g, '__')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120) || 'root';

/**
 * Which build this environment is serving.
 *
 * The build banner prints unsubstituted placeholders on dev and production, because token
 * substitution runs only in the Dockerfile and those are served by IIS (#1306), so it cannot identify
 * a build. The bundle's content hash can: it changes when, and only when, the built code changes.
 */
async function buildIdentity(page) {
  const html = await page.evaluate(async () => {
    const response = await fetch('/', { cache: 'no-store' });

    return response.text();
  });

  const bundles = [...new Set([...html.matchAll(/main[.-][A-Za-z0-9]+\.js/g)].map((m) => m[0]))];

  return bundles[0] || 'unknown-build';
}

/** US Central, named, as everything reported here is (CLAUDE.md). */
const centralNow = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
    .format(new Date())
    .replace(',', '') + ' US Central';

async function routesToCapture(page) {
  const routes = new Set(['/map', '/all-maps']);
  const sections = ['/all-maps/campus-events', '/all-maps/parking', '/all-maps/operations', '/all-maps/campus'];

  for (const section of sections) {
    try {
      await page.goto(baseUrl + section, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500);

      const hrefs = await page.$$eval(
        'a[href^="/events/"], a[href^="/parking/"], a[href^="/operations/"], a[href^="/campus/"], a[href^="/kiosk/"]',
        (anchors) => anchors.map((a) => a.getAttribute('href'))
      );

      hrefs.filter(Boolean).forEach((href) => routes.add(href));
      routes.add(section);
    } catch {
      // A section this environment does not publish is not an error; it contributes nothing.
    }
  }

  if (!routesOnly) {
    // The maps that cannot be reached by URL without choosing in a builder first.
    const inventoryPath = path.join(REPO, 'tools/builder-inventory/builder-inventory.generated.json');

    if (fs.existsSync(inventoryPath)) {
      const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

      for (const map of inventory.maps || []) {
        for (const destination of map.destinations || []) {
          if (destination.shareTarget) {
            routes.add(destination.shareTarget);
          }
        }
      }
    }
  }

  const all = [...routes].sort();

  return only.length > 0 ? all.filter((route) => only.some((part) => route.includes(part))) : all;
}

/**
 * Waits until the map is safe to photograph.
 *
 * Two different signals, in order, both from the map probe and both documented on it:
 *
 * - `ready` means every layer has settled - "layer state is now worth reading". It is **not** a
 *   signal that the canvas is finished.
 * - `drawing` is the later one. `MapView.updating` stays true while the view is fetching or
 *   painting, and the probe says it plainly: "Anything that captures the canvas - a screenshot, a
 *   pixel assertion - has to wait for this, or it records a half-drawn map."
 *
 * Waiting on `ready` alone is how two earlier runs of this tool produced a 45% "difference" that was
 * one side photographed before its basemap had drawn. See docs/testing-maps.md.
 */
async function settle(page) {
  await page.waitForTimeout(1500);

  try {
    await page.waitForFunction(
      () => {
        const root = document.querySelector('tamu-gisc-aggiemap-app-root');

        return root !== null && root.children.length > 0;
      },
      { timeout: 30000 }
    );
  } catch {
    // Captured anyway: a page that never rendered is itself worth seeing in the comparison.
  }

  try {
    // Layers first, then the canvas. A page with no probe is not a map and needs neither.
    await page.waitForFunction(() => !window.__tamuGiscMapProbe || window.__tamuGiscMapProbe.ready === true, {
      timeout: 60000,
      polling: 500
    });

    await page.waitForFunction(() => !window.__tamuGiscMapProbe || window.__tamuGiscMapProbe.drawing === false, {
      timeout: 60000,
      polling: 500
    });
  } catch {
    // As above - a map that never settles is worth seeing, but it is recorded rather than hidden.
  }

  // The notices dismiss themselves after about ten seconds; they are outlasted rather than hidden, so
  // the space they occupied is still compared.
  await page.waitForTimeout(11000);
}

(async () => {
  const started = Date.now();
  const browser = await chromium.launch();
  const probePage = await browser.newPage({ viewport: VIEWPORTS.desktop, timezoneId: 'America/Chicago' });

  await probePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  const build = await buildIdentity(probePage);
  const routes = await routesToCapture(probePage);

  await probePage.close();

  const outDir = path.join(outRoot, envName, build.replace(/\.js$/, ''));

  fs.mkdirSync(path.join(outDir, 'desktop'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'phone'), { recursive: true });

  const manifestPath = path.join(outDir, 'manifest.json');
  const manifest = {
    environment: envName,
    baseUrl: baseUrl,
    build: build,
    capturedAt: centralNow(),
    viewports: VIEWPORTS,
    routeCount: routes.length,
    routes: routes,
    note:
      'Captured by tools/visual-baselines/capture.mjs. The build is the bundle content hash, because ' +
      'the build banner prints placeholders on IIS-served environments (#1306).'
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('environment ' + envName + ' (' + baseUrl + ')');
  console.log('build        ' + build);
  console.log('routes       ' + routes.length + ' x ' + Object.keys(VIEWPORTS).length + ' viewports');
  console.log('out          ' + outDir);

  const jobs = [];

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const route of routes) {
      jobs.push({
        viewportName: viewportName,
        viewport: viewport,
        route: route,
        file: path.join(outDir, viewportName, slugFor(route) + '.png')
      });
    }
  }

  const todo = jobs.filter((job) => !fs.existsSync(job.file));

  console.log('to capture   ' + todo.length + ' (' + (jobs.length - todo.length) + ' already on disk, resuming)\n');

  let done = 0;
  let failed = 0;
  const queue = todo.slice();

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      const context = await browser.newContext({ timezoneId: 'America/Chicago' });
      const page = await context.newPage();

      while (queue.length) {
        const job = queue.shift();

        try {
          await page.setViewportSize(job.viewport);
          await page.goto(baseUrl + job.route, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await settle(page);
          await page.screenshot({ path: job.file });
        } catch (error) {
          failed += 1;
          console.log('  ! ' + job.viewportName + ' ' + job.route + ': ' + String(error).split('\n')[0].slice(0, 90));
        }

        done += 1;

        if (done % 25 === 0) {
          const rate = (Date.now() - started) / done / 1000;
          const left = Math.round((queue.length * rate) / 60);

          console.log('  ' + done + '/' + todo.length + ' captured, ' + failed + ' failed, about ' + left + ' min left');
        }
      }

      await context.close();
    })
  );

  await browser.close();

  manifest.completedAt = centralNow();
  manifest.captured = done - failed;
  manifest.failed = failed;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('\ndone: ' + (done - failed) + ' captured, ' + failed + ' failed, ' + Math.round((Date.now() - started) / 60000) + ' min');
})();
