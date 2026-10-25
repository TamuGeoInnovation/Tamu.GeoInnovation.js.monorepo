/**
 * Builds the pages for browsing a folder of capture sets (#2345).
 *
 *   node tools/visual-baselines/index.mjs <baselines>
 *
 * `<baselines>` is the folder capture.mjs writes into: `<kind>/<release>/` for each set, and
 * `compare/<name>/` for each comparison review.mjs has made. It writes:
 *
 *   <baselines>/index.html                  every set, newest first by kind, and every comparison
 *   <baselines>/<kind>/<release>/index.html  that set as a gallery, desktop or phone, with a filter
 *
 * Everything comes from what is already on disk: each set's manifest.json (release, commit, bundle,
 * when) and its PNGs, and each comparison's summary.json. Run it again after anything changes; on the
 * cluster every capture, comparison and clean-up does, so the site is never behind the folder.
 *
 * Plain HTML with relative links, so the pages open from a workstation's folder as they do from the
 * cluster's site. The look is the repository's shared styles (pages.scss).
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { escape, page, sharedCss } from './page.mjs';
import { slugFor } from './slug.mjs';

const REPOSITORY = 'https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo';

/** Folders in the baselines folder that are not a kind of set. */
const NOT_SETS = new Set(['compare', 'lost+found']);

/** The kinds people look at most, first; any other kind follows in name order. */
const KIND_ORDER = ['production', 'development', 'development-as-production'];

const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

const subdirs = (dir) =>
  isDir(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => !name.startsWith('.') && isDir(path.join(dir, name)))
        .sort()
    : [];

/** Every set under `root`, by kind, newest first: what its manifest says and what is on disk. */
export function readSets(root) {
  const kinds = subdirs(root)
    .filter((kind) => !NOT_SETS.has(kind))
    .sort((a, b) => {
      const rank = (k) => (KIND_ORDER.includes(k) ? KIND_ORDER.indexOf(k) : KIND_ORDER.length);

      return rank(a) - rank(b) || a.localeCompare(b);
    });

  return kinds
    .map((kind) => {
      const sets = subdirs(path.join(root, kind))
        .map((name) => {
          const dir = path.join(root, kind, name);
          const manifest = readJson(path.join(dir, 'manifest.json'));
          const viewports = subdirs(dir);

          if (!manifest && viewports.length === 0) {
            return null;
          }

          const shots = Object.fromEntries(
            viewports.map((viewport) => [viewport, fs.readdirSync(path.join(dir, viewport)).filter((f) => f.endsWith('.png')).sort()])
          );

          return {
            kind,
            name,
            dir,
            manifest: manifest || {},
            shots,
            // capturedAt is "YYYY-MM-DD HH:MM:SS US Central", so it sorts as text; a set with no
            // manifest sorts by when its folder last changed.
            sortKey: manifest?.capturedAt || new Date(fs.statSync(dir).mtimeMs).toISOString()
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

      return { kind, sets };
    })
    .filter((group) => group.sets.length > 0);
}

/** Every comparison under `root/compare`, newest first. */
export function readComparisons(root) {
  return subdirs(path.join(root, 'compare'))
    .map((name) => {
      const dir = path.join(root, 'compare', name);
      const summary = readJson(path.join(dir, 'summary.json'));
      const pageFile = summary?.page || ['index.html', 'review.html'].find((f) => fs.existsSync(path.join(dir, f)));

      if (!pageFile) {
        return null;
      }

      // A comparison made before review.mjs wrote summary.json: its counts are in the page's text.
      let counts = summary;

      if (!counts) {
        const text = fs.readFileSync(path.join(dir, pageFile), 'utf8');
        const found = text.match(/<strong>(\d+)<\/strong>\s+of\s+(\d+)\s+pages changed/);

        counts = found ? { changed: Number(found[1]), pages: Number(found[2]) } : {};
      }

      return {
        name,
        href: `compare/${encodeURIComponent(name)}/${pageFile}`,
        before: summary?.before || '',
        after: summary?.after || '',
        changed: counts.changed,
        pages: counts.pages,
        writtenAt: summary?.writtenAt || '',
        sortKey: summary?.writtenAt || new Date(fs.statSync(dir).mtimeMs).toISOString()
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

/** How many shots a set has, against how many it should, per viewport: "424 / 424". */
function shotCounts(set) {
  const expected = set.manifest.routeCount;

  return Object.entries(set.shots).map(([viewport, files]) => ({
    viewport,
    have: files.length,
    expected,
    complete: expected === undefined || files.length >= expected
  }));
}

const commitLink = (sha) => (sha ? `<a class="mono" href="${REPOSITORY}/commit/${escape(sha)}">${escape(sha.slice(0, 9))}</a>` : '');

const href = (set) => `${encodeURIComponent(set.kind)}/${encodeURIComponent(set.name)}/index.html`;

function homePage(groups, comparisons, shared) {
  const allSets = groups.flatMap((group) => group.sets);

  const setRows = (group) =>
    group.sets
      .map((set) => {
        const m = set.manifest;
        const counts = shotCounts(set)
          .map((c) => `<span class="chip ${c.complete ? 'chip-label' : 'chip-external'}">${escape(c.viewport)} ${c.have}${c.expected === undefined ? '' : ' / ' + c.expected}</span>`)
          .join(' ');

        return `<tr>
          <td><a href="${href(set)}"><strong>${escape(set.name)}</strong></a></td>
          <td>${escape((m.capturedAt || '').replace(' US Central', ''))}</td>
          <td>${commitLink(m.releaseCommit)}</td>
          <td class="mono">${escape(m.build || '')}</td>
          <td>${counts}</td>
        </tr>`;
      })
      .join('\n');

  const kindSections = groups
    .map(
      (group) => `
  <section class="maps-list-section trailer-2">
    <h2>${escape(group.kind)}</h2>
    <div class="table-scroll"><table class="floating-table">
      <thead><tr><th>Release</th><th>Captured (US Central)</th><th>Commit</th><th>Bundle</th><th>Shots</th></tr></thead>
      <tbody>
${setRows(group)}
      </tbody>
    </table></div>
  </section>`
    )
    .join('\n');

  const comparisonRows = comparisons
    .map(
      (c) => `<tr>
          <td><a href="${c.href}"><strong>${escape(c.before && c.after ? `${c.before} → ${c.after}` : c.name)}</strong></a></td>
          <td>${c.pages === undefined ? '' : `<span class="chip ${c.changed > 0 ? 'chip-external' : 'chip-label'}">${c.changed} of ${c.pages} changed</span>`}</td>
          <td>${escape(c.writtenAt.replace(' US Central', ''))}</td>
        </tr>`
    )
    .join('\n');

  const options = allSets.map((set) => `<option>${escape(set.kind + '/' + set.name)}</option>`).join('');

  const compareSection = `
  <section class="maps-list-section trailer-2">
    <h2>Comparisons</h2>
    ${
      comparisons.length
        ? `<div class="table-scroll"><table class="floating-table">
      <thead><tr><th>Before → after</th><th>Pages</th><th>Made (US Central)</th></tr></thead>
      <tbody>
${comparisonRows}
      </tbody>
    </table></div>`
        : '<p class="section-description">None yet.</p>'
    }
    <h3 class="leader-2">Compare two sets</h3>
    <div class="flex compare-pick">
      <label>Before <select id="before">${options}</select></label>
      <label>After <select id="after">${options}</select></label>
    </div>
    <p class="section-description">On the cluster, from <code>12. Visual Baselines</code> in the cluster configuration repository; on a
      workstation, from the monorepo:</p>
    <div class="command"><code id="clusterCommand"></code> <button type="button" class="button secondary copy" data-copy="clusterCommand">Copy</button></div>
    <div class="command"><code id="localCommand"></code> <button type="button" class="button secondary copy" data-copy="localCommand">Copy</button></div>
  </section>`;

  return page({
    shared,
    title: 'Visual baselines',
    heading: 'Visual baselines',
    meta: `${allSets.length} sets and ${comparisons.length} comparisons. A set is every page photographed at one release
      (tools/visual-baselines in the monorepo); a comparison shows what moved between two.`,
    body: `<div class="maps-page-shell">${kindSections}${compareSection}</div>`,
    css: `
  .table-scroll { overflow-x:auto; }
  .floating-table { margin:0.5rem 0; }
  .floating-table td { vertical-align:middle; }
  .compare-pick { gap:1rem; flex-wrap:wrap; }
  .command { display:flex; gap:0.75rem; align-items:center; margin:0.5rem 0; }
  .command code { background:#f1f3f4; padding:0.5rem 0.75rem; border-radius:6px; overflow-x:auto; white-space:nowrap; }
  .command .button { width:auto; padding:0.4rem 1rem; }
`,
    script: `
  const before = document.getElementById('before');
  const after = document.getElementById('after');
  // Newest first, so the two most recent sets of the first kind are the obvious pair.
  if (after.options.length > 1) { before.selectedIndex = 1; after.selectedIndex = 0; }
  const show = () => {
    const b = before.value, a = after.value;
    const [bk, br] = b.split('/'), [ak, ar] = a.split('/');
    const out = bk === ak ? br + '-vs-' + ar : bk + '-' + br + '-vs-' + ak + '-' + ar;
    document.getElementById('clusterCommand').textContent = '.\\\\start-compare.ps1 -Before ' + b + ' -After ' + a;
    document.getElementById('localCommand').textContent =
      'node tools/visual-baselines/review.mjs <baselines>/' + b + ' <baselines>/' + a +
      ' <baselines>/compare/' + out + '/diff <baselines>/compare/' + out + '/index.html';
  };
  before.addEventListener('change', show);
  after.addEventListener('change', show);
  show();
  document.querySelectorAll('button.copy').forEach((button) => {
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      button.textContent = 'Copied';
      setTimeout(() => (button.textContent = 'Copy'), 1500);
    });
  });
`
  });
}

function setPage(set, shared) {
  const m = set.manifest;
  const routeOf = new Map((m.routes || []).map((route) => [slugFor(route) + '.png', route]));
  const viewports = Object.keys(set.shots);
  const base = (m.baseUrl || '').replace(/\/$/, '');
  // A map is one screen, so its size is the viewport's, and giving it keeps the grid from jumping as
  // pictures load. A GIS Day shot is the whole page, whose height only the picture knows.
  const size = (viewport) => {
    const v = m.viewports?.[viewport];

    return v && m.app !== 'gisday' ? ` width="${v.width}" height="${v.height}"` : '';
  };

  const figures = viewports
    .map((viewport) =>
      set.shots[viewport]
        .map((file) => {
          const route = routeOf.get(file);
          const label = route || file;
          const src = `${encodeURIComponent(viewport)}/${encodeURIComponent(file)}`;

          return `<figure class="shot" data-viewport="${escape(viewport)}" data-label="${escape(label.toLowerCase())}">
      <a href="${src}" target="_blank"><img loading="lazy" src="${src}" alt="${escape(label)}"${size(viewport)}></a>
      <figcaption><span class="mono">${escape(label)}</span>${route && base ? ` <a href="${escape(base + route)}" target="_blank">live</a>` : ''}</figcaption>
    </figure>`;
        })
        .join('\n')
    )
    .join('\n');

  const facts = [
    m.environment && `${escape(m.environment)}${m.actingAs ? ` as ${escape(m.actingAs)}` : ''}`,
    m.baseUrl && `<a href="${escape(m.baseUrl)}">${escape(m.baseUrl)}</a>`,
    m.releaseCommit && `commit ${commitLink(m.releaseCommit)}`,
    m.build && `bundle <span class="mono">${escape(m.build)}</span>`,
    m.capturedAt && `captured ${escape(m.capturedAt)}`,
    shotCounts(set)
      .map((c) => `${c.have}${c.expected === undefined ? '' : ' of ' + c.expected} ${escape(c.viewport)}`)
      .join(', ')
  ].filter(Boolean);

  return page({
    shared,
    title: `${set.kind}/${set.name}`,
    crumbs: `<a href="../../index.html">Visual baselines</a> / ${escape(set.kind)}`,
    heading: escape(set.name),
    meta: facts.join(' &middot; '),
    controls: `${viewports
      .map((v, i) => `<label><input type="radio" name="viewport" value="${escape(v)}"${i === 0 ? ' checked' : ''}> ${escape(v)}</label>`)
      .join(' ')}
    <input type="search" id="filter" placeholder="Filter by route" aria-label="Filter by route">
    <span class="meta" id="count"></span>
    <span class="meta">Click a picture for full size; "live" opens the page itself.</span>`,
    body: `<div class="grid">\n${figures}\n</div>`,
    css: `
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; }
  body.phone .grid { grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); }
  .shot { margin:0; }
  .shot img { width:100%; height:auto; display:block; border:1px solid #e3e0dd; border-radius:6px; background:#fff; }
  .shot figcaption { font-size:12px; color:#555; margin-top:4px; overflow-wrap:anywhere; }
  .shot.hidden { display:none; }
  #filter { padding:0.35rem 0.6rem; border:1px solid #ccc; border-radius:6px; min-width:240px; }
`,
    script: `
  const shots = [...document.querySelectorAll('.shot')];
  const filter = document.getElementById('filter');
  const show = () => {
    const viewport = document.querySelector('input[name=viewport]:checked')?.value;
    const text = filter.value.trim().toLowerCase();
    let shown = 0;
    for (const shot of shots) {
      const on = shot.dataset.viewport === viewport && (!text || shot.dataset.label.includes(text));
      shot.classList.toggle('hidden', !on);
      shown += on ? 1 : 0;
    }
    document.body.classList.toggle('phone', viewport === 'phone');
    document.getElementById('count').textContent = shown + ' shown';
  };
  document.querySelectorAll('input[name=viewport]').forEach((input) => input.addEventListener('change', show));
  filter.addEventListener('input', show);
  show();
`
  });
}

/**
 * Writes the home page and every set's gallery; returns what it wrote, for the log and the tests.
 * `shared` is the shared styles; the tests pass their own, so they need no Sass compiler.
 */
export function buildIndex(root, { shared = sharedCss() } = {}) {
  const groups = readSets(root);
  const comparisons = readComparisons(root);
  const written = [];

  for (const set of groups.flatMap((group) => group.sets)) {
    const file = path.join(set.dir, 'index.html');

    fs.writeFileSync(file, setPage(set, shared));
    written.push(file);
  }

  const home = path.join(root, 'index.html');

  fs.writeFileSync(home, homePage(groups, comparisons, shared));
  written.push(home);

  return { sets: groups.reduce((n, group) => n + group.sets.length, 0), comparisons: comparisons.length, written };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = process.argv[2];

  if (!root || !isDir(root)) {
    console.error('usage: node tools/visual-baselines/index.mjs <baselines folder>');
    process.exit(2);
  }

  const result = buildIndex(root);

  console.log(`wrote ${root}/index.html: ${result.sets} sets, ${result.comparisons} comparisons`);
}
