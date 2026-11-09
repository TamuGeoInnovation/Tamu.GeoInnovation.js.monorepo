// Batch 25 (#2785): after the map settles, do the layer views stop `updating`? Samples every 2 s for a minute.
const { chromium } = require('/w/node_modules/playwright');
const BASE = process.env.BASE || 'https://aggiemap.tamu.edu', LOADS = Number(process.env.LOADS || 3);
const BASEMAP = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';
(async () => {
  const b = await chromium.launch();
  for (let i = 1; i <= LOADS; i++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } });
    const p = await ctx.newPage();
    await p.route(/google-analytics|googletagmanager/, (r) => r.abort());
    await p.goto(`${BASE}/map/d`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 120000 }).catch(() => {});
    const t0 = Date.now(), rows = [];
    for (let k = 0; k < 30; k++) {
      rows.push(await p.evaluate((basemap) => {
        const view = document.querySelector('arcgis-map')?.view;
        const lvs = view.allLayerViews.toArray();
        const bm = lvs.filter((lv) => typeof lv.layer?.url === 'string' && lv.layer.url.startsWith(basemap));
        return { viewUpdating: view.updating, probeDrawing: window.__tamuGiscMapProbe?.drawing,
          basemap: bm.map((lv) => `${lv.layer.layerId}:${lv.updating ? 'U' : '-'}${lv.dataUpdating ? 'D' : '-'}${lv.hasAllFeaturesInView ? 'A' : '!'}`).join(' '),
          othersUpdating: lvs.filter((lv) => lv.updating && !bm.includes(lv)).map((lv) => lv.layer.id).slice(0, 6) };
      }, BASEMAP));
      await p.waitForTimeout(2000);
    }
    const changes = rows.map((r, k) => ({ s: k * 2, ...r })).filter((r, k, a) => k === 0 || JSON.stringify({ ...r, s: 0 }) !== JSON.stringify({ ...a[k - 1], s: 0 }));
    console.log(JSON.stringify({ load: i, settleToFirstSample: Date.now() - t0 - 60000, changes }));
    await ctx.close();
  }
  await b.close();
})();
