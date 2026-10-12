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
 * Output is keyed by environment and **release**, so an environment keeps one set per release and the
 * same release can be compared across environments:
 *
 *   <out>/<env>/<release>/manifest.json    what ran, against what, when (US Central)
 *   <out>/<env>/<release>/desktop/<slug>.png
 *   <out>/<env>/<release>/phone/<slug>.png
 *
 * The release is the tag recording which commit an environment serves - `prod-2026-10-06-2`,
 * `dev-2026-10-06-4` - from `--release`, or the newest tag for that environment's prefix. A tag is a
 * claim, so the manifest also records the **bundle hash actually served**, which is what proves it.
 * Re-capturing a release whose bundle has changed is refused: either the tag is wrong or the
 * environment moved under it, and both matter more than the capture.
 *
 * Baselines live outside the repository by default (`<repo>/../visual-baselines`). A full set runs to
 * hundreds of megabytes per release, which is not what git is for.
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);

  return i === -1 ? fallback : process.argv[i + 1];
};

const flag = (name) => process.argv.includes('--' + name);

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const envName = arg('env', 'production');
const outRoot = arg('out', process.env.AGGIEMAP_BASELINES || path.join(REPO, '..', 'visual-baselines'));
/** The release this environment is serving; defaults to the newest tag for its prefix. */
const releaseArg = arg('release', '');
const force = flag('force');
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

/**
 * Which release this environment is serving.
 *
 * The tag is how this repository records the commit a build came from (`scripts/tag-build.sh`), so it
 * is the name a baseline should carry: it is shared between machines, it outlives the capture, and it
 * is what somebody says when they ask what Construction looked like in a given release.
 *
 * Nothing in the browser proves an environment is serving a tag, so the bundle hash is recorded
 * beside it. That way the claim and the fingerprint can disagree out loud.
 */
function resolveRelease(fallbackBundle) {
  if (releaseArg) {
    return releaseArg;
  }

  const prefix = { production: 'prod-', development: 'dev-' }[envName];

  if (!prefix) {
    // local and local-production are never tagged; name the set for the bundle it served.
    return 'untagged-' + fallbackBundle.replace(/\.js$/, '');
  }

  try {
    const tags = execFileSync('git', ['tag', '--sort=-creatordate', '--list', prefix + '*'], {
      cwd: REPO,
      encoding: 'utf8'
    });
    const newest = tags.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0];

    if (newest) {
      return newest;
    }
  } catch {
    // git is not reachable from in here; say what to pass instead.
  }

  console.error('Could not work out the release for "' + envName + '".');
  console.error('Pass --release <tag>, for example --release ' + prefix + '2026-10-06.');
  process.exit(2);
}

/** The commit a release tag names, when git can be reached. Recorded, never required. */
function releaseCommit(release) {
  try {
    return execFileSync('git', ['rev-parse', release + '^{commit}'], { cwd: REPO, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
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

  const release = resolveRelease(build);
  const outDir = path.join(outRoot, envName, release);
  const manifestPath = path.join(outDir, 'manifest.json');

  // A set already here for this release must have come from the same bundle. If it did not, either
  // the tag names a different build or the environment moved under it, and overwriting would quietly
  // replace a baseline with pictures of something else.
  if (fs.existsSync(manifestPath)) {
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (existing.build && existing.build !== build && !force) {
      console.error('Release ' + release + ' on ' + envName + ' was captured from bundle ' + existing.build + ',');
      console.error('but ' + baseUrl + ' is serving ' + build + ' now.');
      console.error('Either the tag is wrong, or this environment has been redeployed since.');
      console.error('Capture under its own release name, or pass --force to overwrite deliberately.');
      process.exit(3);
    }
  }

  fs.mkdirSync(path.join(outDir, 'desktop'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'phone'), { recursive: true });

  const manifest = {
    environment: envName,
    baseUrl: baseUrl,
    release: release,
    releaseCommit: releaseCommit(release),
    build: build,
    capturedAt: centralNow(),
    viewports: VIEWPORTS,
    routeCount: routes.length,
    routes: routes,
    note:
      'Captured by tools/visual-baselines/capture.mjs. `release` is the tag recording which commit ' +
      'this environment serves; `build` is the bundle hash actually served, which is what proves it, ' +
      'because the build banner prints placeholders on IIS-served environments (#1306).'
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('environment ' + envName + ' (' + baseUrl + ')');
  console.log('release      ' + release + (manifest.releaseCommit ? ' (' + manifest.releaseCommit.slice(0, 8) + ')' : ''));
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
