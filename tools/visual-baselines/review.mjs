/**
 * Builds a page for looking at two capture sets side by side.
 *
 *   node tools/visual-baselines/review.mjs <beforeSet> <afterSet> <diffDir> <out.html>
 *
 * A set is a capture directory as `capture.mjs` writes it: `<baselines>/<env>/<release>`. The two
 * need not be the same environment - comparing one release across dev and production asks whether
 * two builds of the same commit render the same, which nothing else answers.
 *
 * For each page that changed beyond rendering noise it also writes a picture of what changed into
 * `<diffDir>`: the after shot dimmed, with each changed pixel in pink (diff.mjs, #2357), shown as a third
 * column.
 *
 * Written next to the images, with relative links, so it opens from disk in a browser with no server
 * and no upload. The question it is for is "does the after look worse", which only a person can
 * answer - the percentages only decide what order to show them in.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

import { centralNow } from './central.mjs';
import { comparePixels } from './diff.mjs';
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

/**
 * How much moved between two shots of the same page, and, when it is more than rendering noise, a
 * picture of where, written to `diffPath` (#2357). Shots of different sizes (a GIS Day page whose
 * height changed) count as wholly changed and get no picture, since their pixels do not line up.
 */
function compareShots(aPath, bPath, diffPath) {
  const a = PNG.sync.read(fs.readFileSync(aPath));
  const b = PNG.sync.read(fs.readFileSync(bPath));

  if (a.width !== b.width || a.height !== b.height) {
    return { ratio: 1, diff: null, sizeChanged: true };
  }

  const size = { width: a.width, height: a.height };
  const { ratio } = comparePixels(a.data, b.data, size);

  if (ratio <= NOISE) {
    return { ratio, diff: null };
  }

  const { picture } = comparePixels(a.data, b.data, { ...size, picture: true });
  const png = new PNG(size);

  picture.copy(png.data);
  fs.mkdirSync(path.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(png));

  return { ratio, diff: diffPath };
}

/** A set's shots taken before their map had finished, keyed `<viewport>/<file>`, from its manifest (#2346). */
const unsettledIn = (root) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')).unsettled || {};
  } catch {
    return {};
  }
};
const unsettledBefore = unsettledIn(beforeRoot);
const unsettledAfter = unsettledIn(afterRoot);

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

  const compared = compareShots(aPath, bPath, path.join(diffRoot, key));

  rows.push({
    key,
    ratio: compared.ratio,
    before: rel(aPath),
    after: rel(bPath),
    diff: compared.diff ? rel(compared.diff) : null,
    sizeChanged: Boolean(compared.sizeChanged),
    // Either side photographed before its map had finished: a difference here may be that, not the build.
    unfinished: [unsettledBefore[key] && 'before: ' + unsettledBefore[key], unsettledAfter[key] && 'after: ' + unsettledAfter[key]].filter(Boolean)
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
      ${r.unfinished.length ? `<span class="chip chip-label" title="${escape(r.unfinished.join('; '))}">unfinished ${escape(r.unfinished.map((u) => u.split(':')[0]).join(' and '))}</span>` : ''}
      <span class="chip ${r.ratio > NOISE ? 'chip-external' : 'chip-label'}">${pct(r)}</span>
    </header>
    <div class="pair">
      <figure><figcaption>Before &mdash; ${escape(beforeName)}</figcaption><a href="${r.before}" target="_blank"><img loading="lazy" src="${r.before}" alt="before"></a></figure>
      <figure><figcaption>After &mdash; ${escape(afterName)}</figcaption><a href="${r.after}" target="_blank"><img loading="lazy" src="${r.after}" alt="after"></a></figure>
      ${
        r.diff
          ? `<figure class="diffcol"><figcaption>What changed &mdash; in pink, over the after picture dimmed</figcaption><a href="${r.diff}" target="_blank"><img loading="lazy" src="${r.diff}" alt="changed areas"></a></figure>`
          : r.sizeChanged
            ? '<figure class="diffcol"><figcaption>What changed</figcaption><p class="meta">The page is a different size, so its pixels do not line up: compare the two by eye.</p></figure>'
            : ''
      }
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
    <label><input type="checkbox" id="showDiff" checked> Show what changed</label>
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
    {
      before: beforeName,
      after: afterName,
      page: path.basename(outFile),
      pages: rows.length,
      changed,
      unfinished: rows.filter((r) => r.unfinished.length).length,
      noise: NOISE,
      writtenAt: centralNow()
    },
    null,
    2
  )
);
console.log(`wrote ${outFile}: ${rows.length} pages, ${changed} changed`);
