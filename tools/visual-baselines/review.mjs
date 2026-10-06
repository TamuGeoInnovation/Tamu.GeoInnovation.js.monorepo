/**
 * Builds a page for looking at two capture sets side by side.
 *
 *   node tools/visual-baselines/review.mjs <beforeDir> <afterDir> <diffDir> <out.html>
 *
 * Written next to the images, with relative links, so it opens from disk in a browser with no server
 * and no upload. The question it is for is "does the after look worse", which only a person can
 * answer - the percentages only decide what order to show them in.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

const [beforeRoot, afterRoot, diffRoot, outFile] = process.argv.slice(2);

/** Rendering noise: an unchanged map page differs by a few hundredths of a percent (#1105). */
const NOISE = 0.005;

function shots(root) {
  const found = new Map();
  const base = path.join(root, 'local', 'unknown-build');

  for (const viewport of fs.readdirSync(base)) {
    const dir = path.join(base, viewport);

    if (!fs.statSync(dir).isDirectory()) {
      continue;
    }

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

const card = (r) => `
  <section class="row${r.ratio > NOISE ? '' : ' same'}" data-changed="${r.ratio > NOISE}">
    <header>
      <h2>${r.key}</h2>
      <span class="badge ${r.ratio > NOISE ? 'hot' : 'cool'}">${pct(r)}</span>
    </header>
    <div class="pair">
      <figure><figcaption>Before &mdash; shipped today</figcaption><a href="${r.before}" target="_blank"><img loading="lazy" src="${r.before}" alt="before"></a></figure>
      <figure><figcaption>After &mdash; symbology from the service</figcaption><a href="${r.after}" target="_blank"><img loading="lazy" src="${r.after}" alt="after"></a></figure>
      ${r.diff ? `<figure class="diffcol"><figcaption>Changed pixels</figcaption><a href="${r.diff}" target="_blank"><img loading="lazy" src="${r.diff}" alt="diff"></a></figure>` : ''}
    </div>
  </section>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Service symbology review</title>
<style>
  :root { --bg:#faf9f8; --fg:#1b1b1b; --muted:#6b6b6b; --line:#e3e0dd; --maroon:#500000; --hot:#b3001b; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --bg:#141414; --fg:#eee; --muted:#9a9a9a; --line:#2e2e2e; --maroon:#d08a8a; }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif; }
  header.top { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:14px 16px; }
  header.top h1 { margin:0 0 4px; font-size:19px; color:var(--maroon); }
  .meta { color:var(--muted); font-size:13px; }
  .controls { margin-top:10px; display:flex; gap:14px; align-items:center; flex-wrap:wrap; font-size:13px; }
  main { padding:16px; max-width:2000px; margin:0 auto; }
  .row { border:1px solid var(--line); border-radius:10px; margin-bottom:18px; background:color-mix(in srgb, var(--bg) 92%, #000 8%); }
  .row header { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid var(--line); }
  .row h2 { margin:0; font-size:14px; font-weight:600; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  .badge { margin-left:auto; font-size:12px; padding:2px 9px; border-radius:999px; border:1px solid var(--line); }
  .badge.hot { color:#fff; background:var(--hot); border-color:var(--hot); }
  .badge.cool { color:var(--muted); }
  .pair { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:12px; }
  figure { margin:0; }
  figcaption { font-size:12px; color:var(--muted); margin-bottom:6px; }
  img { width:100%; height:auto; display:block; border:1px solid var(--line); border-radius:6px; background:#fff; }
  .same { opacity:.55; }
  body.only-changed .row[data-changed="false"] { display:none; }
  body.hide-diff .diffcol { display:none; }
  body.hide-diff .pair { grid-template-columns:repeat(2,1fr); }
  @media (max-width:900px) { .pair { grid-template-columns:1fr; } body.hide-diff .pair { grid-template-columns:1fr; } }
</style>
</head>
<body class="only-changed">
<header class="top">
  <h1>Service symbology &mdash; before and after</h1>
  <div class="meta">
    <strong>${changed}</strong> of ${rows.length} pages changed beyond rendering noise (${(NOISE * 100).toFixed(1)}%).
    Left is what ships today, with symbology hard-coded in the definitions. Right takes it from each
    layer&rsquo;s portal item. The question is whether the right-hand side looks <em>worse</em>.
  </div>
  <div class="controls">
    <label><input type="checkbox" id="onlyChanged" checked> Only pages that changed</label>
    <label><input type="checkbox" id="showDiff" checked> Show the changed-pixels column</label>
    <span class="meta">Click any image to open it full size.</span>
  </div>
</header>
<main>
${rows.map(card).join('\n')}
</main>
<script>
  const body = document.body;
  document.getElementById('onlyChanged').addEventListener('change', (e) => {
    body.classList.toggle('only-changed', e.target.checked);
  });
  document.getElementById('showDiff').addEventListener('change', (e) => {
    body.classList.toggle('hide-diff', !e.target.checked);
  });
</script>
</body>
</html>
`;

fs.writeFileSync(outFile, html);
console.log(`wrote ${outFile}: ${rows.length} pages, ${changed} changed`);
