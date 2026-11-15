/**
 * Picking pages on a comparison or a gallery (#2841), shared by review.mjs and index.mjs so both work the
 * same way: a checkbox on each page, and a "Selected" bar that gives a list to share (with full links to
 * the pictures), a link to the same page showing only the picks, and the commands to retake those pages and
 * compare the retake with the set.
 *
 * Static: nothing is sent anywhere. Picks live in the page's address (`#pick=`) and, if the browser allows
 * it, in localStorage, so they can be gathered over several visits.
 */

import { escape } from './page.mjs';

/** The checkbox for one page. `links` are [label, relative href] for the list. */
export function pickBox({ key, slug, route, viewport, ratio = null, links = [] }) {
  return `<label class="pick" title="Pick this page"><input type="checkbox" data-pick-key="${escape(key)}" data-slug="${escape(slug)}"
    data-route="${escape(route)}" data-viewport="${escape(viewport)}"${ratio === null ? '' : ` data-ratio="${escape(ratio)}"`}
    data-links="${escape(JSON.stringify(links))}"> pick</label>`;
}

export const PICK_CSS = `
  .pick { font-size:12px; color:#6b6b6b; white-space:nowrap; cursor:pointer; }
  .pickbar { position:sticky; bottom:0; z-index:6; display:none; flex-wrap:wrap; gap:10px; align-items:center;
    background:#fff; border-top:2px solid #500000; padding:10px 16px; }
  body.picking .pickbar { display:flex; }
  .pickbar .button { width:auto; padding:0.4rem 1rem; }
  .pickbar strong { margin-right:6px; }
  body.picked-only [data-pick-item]:not(.picked) { display:none !important; }
`;

/** The bar, placed once at the end of the page. */
export const PICK_BAR = `<div class="pickbar" role="region" aria-label="Picked pages">
  <strong id="pickCount">0 picked</strong>
  <button type="button" class="button secondary" data-pick="list">Copy the list</button>
  <button type="button" class="button secondary" data-pick="link">Copy a link to these</button>
  <button type="button" class="button secondary" data-pick="retake">Copy the retake command</button>
  <button type="button" class="button secondary" data-pick="compare">Copy the compare command</button>
  <button type="button" class="button secondary" data-pick="only">Show only these</button>
  <button type="button" class="button secondary" data-pick="clear">Clear</button>
</div>`;

/**
 * The script, given what a retake needs: the set to retake (`kind`, `release`, `environment`, and `as` and
 * `app` when it has them) and a key for remembering picks (`pageId`).
 */
export function pickScript(config) {
  return `
(() => {
  const config = ${JSON.stringify(config)};
  const boxes = [...document.querySelectorAll('[data-pick-key]')];
  const store = (() => { try { return window.localStorage; } catch { return null; } })();
  const remembered = () => { try { return JSON.parse(store?.getItem('pick:' + config.pageId) || '[]'); } catch { return []; } };
  const fromHash = new URLSearchParams(location.hash.slice(1)).get('pick');
  const picked = new Set(fromHash ? fromHash.split(',').map(decodeURIComponent) : remembered());
  const folder = 'C:\\\\TAMU\\\\kubernetes-config\\\\12. Visual Baselines';

  const refresh = () => {
    for (const box of boxes) {
      box.checked = picked.has(box.dataset.pickKey);
      box.closest('[data-pick-item]')?.classList.toggle('picked', box.checked);
    }
    document.body.classList.toggle('picking', picked.size > 0);
    document.getElementById('pickCount').textContent = picked.size + ' picked';
    try { store?.setItem('pick:' + config.pageId, JSON.stringify([...picked])); } catch {}
  };
  const chosen = () => boxes.filter((box) => picked.has(box.dataset.pickKey));
  // The retake's name: the release, "-recheck", and the time in US Central, so each retake is its own set.
  const stamp = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric',
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return p.year + p.month + p.day + '-' + p.hour + p.minute;
  };
  let retakeName = null;
  const name = () => (retakeName ||= config.release + '-recheck-' + stamp());
  const text = {
    list: () => chosen().map((box) => {
      const links = JSON.parse(box.dataset.links).map(([label, href]) => label + ': ' + new URL(href, location.href).href);
      const ratio = box.dataset.ratio ? ', ' + box.dataset.ratio + ' changed' : '';
      return '- ' + box.dataset.route + ' (' + box.dataset.viewport + ratio + ')' + (links.length ? '\\n  ' + links.join('\\n  ') : '');
    }).join('\\n'),
    link: () => location.href.split('#')[0] + '#pick=' + [...picked].map(encodeURIComponent).join(','),
    retake: () => 'cd "' + folder + '"; .\\\\start-capture.ps1 -Environment ' + config.environment + ' -Release ' + name() +
      ' -Recheck -Only ' + [...new Set(chosen().map((box) => box.dataset.slug))].join(',') +
      (config.as ? ' -As ' + config.as : '') + (config.app === 'gisday' ? ' -App gisday' : ''),
    compare: () => 'cd "' + folder + '"; .\\\\start-compare.ps1 -Before ' + config.kind + '/' + config.release +
      ' -After ' + config.kind + '-recheck/' + name()
  };
  const copy = async (button, value) => {
    const was = button.textContent;
    try { await navigator.clipboard.writeText(value); button.textContent = 'Copied'; }
    catch { window.prompt('Copy this:', value); }
    setTimeout(() => (button.textContent = was), 1500);
  };

  boxes.forEach((box) => box.addEventListener('change', () => {
    box.checked ? picked.add(box.dataset.pickKey) : picked.delete(box.dataset.pickKey);
    refresh();
  }));
  document.querySelectorAll('[data-pick]').forEach((button) => button.addEventListener('click', () => {
    const what = button.dataset.pick;
    if (what === 'clear') { picked.clear(); document.body.classList.remove('picked-only'); return refresh(); }
    if (what === 'only') {
      const on = document.body.classList.toggle('picked-only');
      button.textContent = on ? 'Show every page' : 'Show only these';
      return;
    }
    copy(button, text[what]());
  }));
  if (fromHash) {
    // A shared link opens showing only its picks.
    document.body.classList.add('picked-only');
    document.querySelector('[data-pick="only"]').textContent = 'Show every page';
  }
  refresh();
})();
`;
}
