/**
 * Builds a page for looking at two capture sets side by side.
 *
 *   node tools/visual-baselines/review.mjs <beforeSet> <afterSet> <diffDir> <out.html>
 *
 * A set is a capture directory as `capture.mjs` writes it: `<baselines>/<env>/<release>`. The two
 * need not be the same environment - comparing one release across dev and production asks whether
 * two builds of the same commit render the same, which nothing else answers.
 *
 * Written next to the images, with relative links, so it opens from disk in a browser with no server
 * and no upload. The question it is for is "does the after look worse", which only a person can
 * answer - the percentages only decide what order to show them in.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

import { centralNow } from './central.mjs';
import { escape, page } from './page.mjs';

const [beforeRoot, afterRoot, diffRoot, outFile] = process.argv.slice(2);

/** Rendering noise: an unchanged map page differs by a few hundredths of a percent (#1105). */
const NOISE = 0.005;

/**
 * Every shot in a capture set, keyed `<viewport>/<file>` so two sets line up by route.
 *
 * `root` is a set directory - `<baselines>/production/prod-2026-10-06-2` - which holds the viewport
 * folders and a manifest. It used to assume `local/unknown-build` underneath, from the one-off
 * experiment this was written for, which made it useless on any real set.
 */
function shots(root) {
  const found = new Map();
  const base = root;

  if (!fs.existsSync(base)) {
    console.error('No such capture set: ' + base);
    process.exit(2);
  }

  const viewports = fs.readdirSync(base).filter((entry) => fs.statSync(path.join(base, entry)).isDirectory());

  if (viewports.length === 0) {
    console.error(base + ' holds no viewport folders. Pass a set directory, for example');
    console.error('  <baselines>/production/prod-2026-10-06-2');
    process.exit(2);
  }

  for (const viewport of viewports) {
    const dir = path.join(base, viewport);

    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.png')) {
        found.set(`${viewport}/${file}`, path.join(dir, file));
      }
    }
  }

  return found;
}

function ratio(aPath, bPath) {
  const a = PNG.sync.read(fs.readFileSync(aPath));
  const b = PNG.sync.read(fs.readFileSync(bPath));

  if (a.width !== b.width || a.height !== b.height) {
    return 1;
  }

  let changed = 0;

  for (let i = 0; i < a.data.length; i += 4) {
    if (
      Math.abs(a.data[i] - b.data[i]) > 24 ||
      Math.abs(a.data[i + 1] - b.data[i + 1]) > 24 ||
      Math.abs(a.data[i + 2] - b.data[i + 2]) > 24
    ) {
      changed += 1;
    }
  }

  return changed / (a.width * a.height);
}

const before = shots(beforeRoot);
const after = shots(afterRoot);
const outDir = path.dirname(outFile);
const rel = (p) => path.relative(outDir, p).split(path.sep).join('/');

const rows = [];

for (const [key, aPath] of before) {
  const bPath = after.get(key);

  if (!bPath) {
    continue;
  }

  const diffPath = path.join(diffRoot, key);

  rows.push({
    key,
    ratio: ratio(aPath, bPath),
    before: rel(aPath),
    after: rel(bPath),
    diff: fs.existsSync(diffPath) ? rel(diffPath) : null
  });
}

rows.sort((x, y) => y.ratio - x.ratio);

const changed = rows.filter((r) => r.ratio > NOISE).length;
const pct = (r) => (r.ratio * 100).toFixed(2) + '%';

/** A set's name as people say it: `production/prod-2026-10-20`, from its folder. */
const setName = (root) => path.basename(path.dirname(path.resolve(root))) + '/' + path.basename(path.resolve(root));
const beforeName = setName(beforeRoot);
const afterName = setName(afterRoot);

const card = (r) => `
  <section class="row${r.ratio > NOISE ? '' : ' same'}" data-changed="${r.ratio > NOISE}">
    <header>
      <h2>${escape(r.key)}</h2>
      <span class="chip ${r.ratio > NOISE ? 'chip-external' : 'chip-label'}">${pct(r)}</span>
    </header>
    <div class="pair">
      <figure><figcaption>Before &mdash; ${escape(beforeName)}</figcaption><a href="${r.before}" target="_blank"><img loading="lazy" src="${r.before}" alt="before"></a></figure>
      <figure><figcaption>After &mdash; ${escape(afterName)}</figcaption><a href="${r.after}" target="_blank"><img loading="lazy" src="${r.after}" alt="after"></a></figure>
      ${r.diff ? `<figure class="diffcol"><figcaption>Changed pixels</figcaption><a href="${r.diff}" target="_blank"><img loading="lazy" src="${r.diff}" alt="diff"></a></figure>` : ''}
    </div>
  </section>`;

const css = `
  .row { border:1px solid #e3e0dd; border-radius:10px; margin-bottom:18px; background:#fafafa; }
  .row header { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid #e3e0dd; }
  .row h2 { margin:0; font-size:14px; font-weight:600; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  .row .chip { margin-left:auto; }
  .pair { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:12px; }
  figure { margin:0; }
  figcaption { font-size:12px; color:#6b6b6b; margin-bottom:6px; }
  .pair img { width:100%; }
  .same { opacity:.55; }
  body.only-changed .row[data-changed="false"] { display:none; }
  body.hide-diff .diffcol { display:none; }
  body.hide-diff .pair { grid-template-columns:repeat(2,1fr); }
  @media (max-width:900px) { .pair { grid-template-columns:1fr; } body.hide-diff .pair { grid-template-columns:1fr; } }
`;

// The home page (index.mjs) is one folder up from compare/<name>/ and two from a set.
const home = rel(path.join(path.dirname(path.resolve(beforeRoot)), '..', 'index.html'));

const html = page({
  title: `${beforeName} → ${afterName}`,
  crumbs: `<a href="${home}">Visual baselines</a> / Comparisons`,
  heading: `${escape(beforeName)} &rarr; ${escape(afterName)}`,
  meta: `<strong>${changed}</strong> of ${rows.length} pages changed beyond rendering noise (${(NOISE * 100).toFixed(1)}%),
    most changed first. The question is whether the right-hand side looks <em>worse</em>; only a person can answer it.`,
  controls: `<label><input type="checkbox" id="onlyChanged" checked> Only pages that changed</label>
    <label><input type="checkbox" id="showDiff" checked> Show the changed-pixels column</label>
    <span class="meta">Click any image to open it full size.</span>`,
  body: rows.map(card).join('\n'),
  css,
  bodyClass: 'only-changed',
  script: `
  const body = document.body;
  document.getElementById('onlyChanged').addEventListener('change', (e) => {
    body.classList.toggle('only-changed', e.target.checked);
  });
  document.getElementById('showDiff').addEventListener('change', (e) => {
    body.classList.toggle('hide-diff', !e.target.checked);
  });
`
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html);

// What the home page lists for this comparison, so it need not read the page back.
fs.writeFileSync(
  path.join(outDir, 'summary.json'),
  JSON.stringify(
    { before: beforeName, after: afterName, page: path.basename(outFile), pages: rows.length, changed, noise: NOISE, writtenAt: centralNow() },
    null,
    2
  )
);
console.log(`wrote ${outFile}: ${rows.length} pages, ${changed} changed`);
