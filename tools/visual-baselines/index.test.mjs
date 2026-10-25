/**
 * The pages for browsing a folder of capture sets (#2345).
 *
 *   node --test tools/visual-baselines/*.test.mjs
 *
 * Each test builds its own throwaway baselines folder, so nothing here reads real sets.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { buildIndex, readComparisons, readSets } from './index.mjs';
import { slugFor } from './slug.mjs';

/** A set as capture.mjs leaves it: a manifest, and a PNG per route and viewport (the bytes do not matter). */
function addSet(root, kind, release, { capturedAt, routes = ['/all-maps', '/events/big-event'], missing = 0, manifest = true } = {}) {
  const dir = path.join(root, kind, release);

  for (const viewport of ['desktop', 'phone']) {
    fs.mkdirSync(path.join(dir, viewport), { recursive: true });

    for (const route of routes.slice(0, routes.length - missing)) {
      fs.writeFileSync(path.join(dir, viewport, slugFor(route) + '.png'), 'png');
    }
  }

  if (manifest) {
    fs.writeFileSync(
      path.join(dir, 'manifest.json'),
      JSON.stringify({
        environment: kind,
        baseUrl: 'https://aggiemap.tamu.edu',
        release,
        releaseCommit: '8463ac6af99774e299cdaace8ce389b03af9d151',
        build: 'main-ABC.js',
        capturedAt,
        viewports: { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } },
        routeCount: routes.length,
        routes
      })
    );
  }

  return dir;
}

/** The tests check what the pages say, not how they look, so they need no Sass compiler. */
const NO_STYLES = { shared: '' };

const folder = () => fs.mkdtempSync(path.join(os.tmpdir(), 'baselines-'));

test('sets are grouped by kind, production first, each newest first', () => {
  const root = folder();

  addSet(root, 'development', 'dev-2026-10-21', { capturedAt: '2026-10-21 10:00:00 US Central' });
  addSet(root, 'production', 'prod-2026-10-16', { capturedAt: '2026-10-16 09:00:00 US Central' });
  addSet(root, 'production', 'prod-2026-10-20', { capturedAt: '2026-10-20 16:57:00 US Central' });
  fs.mkdirSync(path.join(root, 'lost+found'));

  const groups = readSets(root);

  assert.deepEqual(
    groups.map((g) => [g.kind, g.sets.map((s) => s.name)]),
    [
      ['production', ['prod-2026-10-20', 'prod-2026-10-16']],
      ['development', ['dev-2026-10-21']]
    ]
  );
});

test('a set counts the shots on disk against the routes its manifest lists', () => {
  const root = folder();

  addSet(root, 'production', 'prod-2026-10-20', { capturedAt: '2026-10-20 16:57:00 US Central', missing: 1 });
  buildIndex(root, NO_STYLES);

  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  assert.match(home, /desktop 1 \/ 2/);
  assert.match(home, /chip-external/, 'an incomplete set is marked');
});

test('a set gallery names each shot by its route and links the live page', () => {
  const root = folder();
  const dir = addSet(root, 'production', 'prod-2026-10-20', { capturedAt: '2026-10-20 16:57:00 US Central' });

  buildIndex(root, NO_STYLES);

  const gallery = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

  assert.match(gallery, /\/events\/big-event/);
  assert.match(gallery, /href="https:\/\/aggiemap\.tamu\.edu\/events\/big-event"/);
  assert.match(gallery, /src="desktop\/events-big-event\.png"/);
  assert.match(gallery, /width="1440" height="900"/);
  assert.match(gallery, /href="\.\.\/\.\.\/index\.html"/, 'the way back to the home page is relative');
});

test('a comparison is listed from its summary, or from the page an older review wrote', () => {
  const root = folder();
  const newer = path.join(root, 'compare', 'prod-2026-10-16-vs-prod-2026-10-20');
  const older = path.join(root, 'compare', 'old-one');

  fs.mkdirSync(newer, { recursive: true });
  fs.mkdirSync(older, { recursive: true });
  fs.writeFileSync(path.join(newer, 'index.html'), '<html></html>');
  fs.writeFileSync(
    path.join(newer, 'summary.json'),
    JSON.stringify({
      before: 'production/prod-2026-10-16',
      after: 'production/prod-2026-10-20',
      page: 'index.html',
      pages: 848,
      changed: 9,
      writtenAt: '2026-10-25 12:10:58 US Central'
    })
  );
  fs.writeFileSync(path.join(older, 'review.html'), '<div><strong>3</strong> of 30 pages changed beyond rendering noise</div>');

  const comparisons = readComparisons(root);
  const byName = Object.fromEntries(comparisons.map((c) => [c.name, c]));

  assert.equal(byName['prod-2026-10-16-vs-prod-2026-10-20'].changed, 9);
  assert.equal(byName['prod-2026-10-16-vs-prod-2026-10-20'].href, 'compare/prod-2026-10-16-vs-prod-2026-10-20/index.html');
  assert.deepEqual([byName['old-one'].changed, byName['old-one'].pages], [3, 30]);
  assert.equal(byName['old-one'].href, 'compare/old-one/review.html');
});

test('text from a manifest is escaped, not run', () => {
  const root = folder();

  addSet(root, 'production', 'prod-x', { capturedAt: '2026-10-20 <script>alert(1)</script>', routes: ['/a<b>'] });
  buildIndex(root, NO_STYLES);

  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const gallery = fs.readFileSync(path.join(root, 'production', 'prod-x', 'index.html'), 'utf8');

  assert.doesNotMatch(home, /<script>alert/);
  assert.match(gallery, /\/a&lt;b&gt;/);
});

test('an empty folder still gets a home page', () => {
  const root = folder();
  const result = buildIndex(root, NO_STYLES);

  assert.equal(result.sets, 0);
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /None yet/);
});
