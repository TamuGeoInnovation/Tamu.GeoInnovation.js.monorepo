// Batch 25 (#2785): does a basemap tile query that answers HTTP 200 with an error body reach the SDK as a failed tile?
// Per load: error bodies seen on the wire, Esri's "Failed to load tile" console errors, and (if the view can be reached)
// each basemap layer view's hasAllFeaturesInView / updating / dataUpdating once the map has settled.
const { chromium } = require('/w/node_modules/playwright');
const BASE = process.env.BASE || 'https://aggiemap.tamu.edu', LOADS = Number(process.env.LOADS || 10);
const BASEMAP = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';

(async () => {
  const b = await chromium.launch();
  for (let i = 1; i <= LOADS; i++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } });
    const p = await ctx.newPage();
    await p.route(/google-analytics|googletagmanager/, (r) => r.abort());
    const wire = [], pending = [], consoleErrors = [];
    p.on('console', (m) => { if (/Failed to load tile|FeatureSourceEventLog/.test(m.text())) consoleErrors.push(m.text().slice(0, 160)); });
    p.on('response', (res) => {
      const u = res.url(); if (!u.startsWith(BASEMAP) || !/\/query\?/.test(u)) return;
      pending.push(res.body().then((buf) => {
        const m = buf.subarray(0, 300).toString('utf8').match(/"error"\s*:\s*\{\s*"code"\s*:\s*(\d+)/);
        if (m) wire.push(`layer ${u.match(/MapServer\/(\d+)/)[1]}: ${m[1]}`);
      }).catch(() => {}));
    });
    await p.goto(`${BASE}/map/d`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 120000 }).catch(() => {});
    await p.waitForTimeout(5000); await Promise.all(pending);
    const views = await p.evaluate(async (basemap) => {
      const el = document.querySelector('arcgis-map');
      const view = el?.view;
      if (!view) return { reached: false, tags: [...new Set([...document.querySelectorAll('*')].map((e) => e.tagName.toLowerCase()).filter((t) => t.includes('-') && /map|esri|arcgis/.test(t)))] };
      const out = [];
      for (const lv of view.allLayerViews.toArray()) {
        const url = lv.layer?.url;
        if (typeof url === 'string' && url.startsWith(basemap)) {
          out.push({ layer: `${lv.layer.id} (${url.slice(basemap.length)}/${lv.layer.layerId ?? ''})`, hasAllFeaturesInView: lv.hasAllFeaturesInView,
            updating: lv.updating, dataUpdating: lv.dataUpdating, visible: lv.layer.visible, suspended: lv.suspended });
        }
      }
      return { reached: true, out };
    }, BASEMAP).catch((e) => ({ error: String(e).slice(0, 200) }));
    console.log(JSON.stringify({ load: i, wireErrors: wire, consoleErrors: consoleErrors.length, consoleSample: consoleErrors[0], views }));
    await ctx.close();
  }
  await b.close();
})();
