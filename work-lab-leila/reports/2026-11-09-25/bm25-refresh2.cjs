// Batch 25 (#2785): after a basemap layer loses a tile, what does layer.refresh() do?
// Also: do esriConfig.request.interceptors see the layer view's tile queries (which run in a worker)?
// Research only, in a throwaway browser; nothing in the application changes.
const { chromium } = require('/w/node_modules/playwright');
const BASE = process.env.BASE || 'https://aggiemap.tamu.edu', LOADS = Number(process.env.LOADS || 12);
const BASEMAP = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';

(async () => {
  const b = await chromium.launch();
  for (let i = 1; i <= LOADS; i++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } });
    const p = await ctx.newPage();
    await p.route(/google-analytics|googletagmanager/, (r) => r.abort());
    const sent = [], errs = [];
    p.on('response', (res) => {
      const u = res.url(); if (!u.startsWith(BASEMAP) || !/\/query\?/.test(u)) return;
      const t = Date.now();
      res.body().then((buf) => { if (/"error"\s*:/.test(buf.subarray(0, 300).toString())) errs.push({ layer: u.match(/MapServer\/(\d+)/)[1], t }); }).catch(() => {});
    });
    p.on('request', (req) => { const m = req.url().match(/MapServer\/(\d+)\/query\?/); if (req.url().startsWith(BASEMAP) && m) sent.push({ layer: m[1], t: Date.now() }); });
    await p.goto(`${BASE}/map/d`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 120000 }).catch(() => {});
    await p.waitForTimeout(5000);
    const result = await p.evaluate(async (basemap) => {
      const view = document.querySelector('arcgis-map')?.view;
      if (!view) return { reached: false };
      const lvs = view.allLayerViews.toArray().filter((lv) => typeof lv.layer?.url === 'string' && lv.layer.url.startsWith(basemap));
      const state = () => lvs.map((lv) => ({ id: lv.layer.layerId, all: lv.hasAllFeaturesInView, updating: lv.updating, dataUpdating: lv.dataUpdating }));
      const lost = lvs.filter((lv) => !lv.hasAllFeaturesInView);
      // Does a request interceptor see the tile queries? Register one, then make the view ask again by refreshing.
      const esriConfig = window.require?.('esri/config') ?? null;
      const before = state();
      if (!lost.length) return { reached: true, lost: [], before };
      const lv = lost[0];
      const count = async () => (await lv.queryFeatureCount({ geometry: view.extent })) ;
      const featuresBefore = await count();
      const t0 = Date.now();
      lv.layer.refresh();
      // Sample the layer view's own feature count while the refresh runs, to see whether what is drawn is thrown away.
      const samples = [];
      for (let k = 0; k < 40; k++) {
        await new Promise((r) => setTimeout(r, 250));
        samples.push({ ms: Date.now() - t0, features: await count(), dataUpdating: lv.dataUpdating, all: lv.hasAllFeaturesInView });
      }
      return { reached: true, esriConfig: !!esriConfig, lost: lost.map((x) => x.layer.layerId), refreshed: lv.layer.layerId, featuresBefore,
        minDuring: Math.min(...samples.map((s) => s.features)), after: samples.at(-1), refreshMs: samples.at(-1).ms, before, t0 };
    }, BASEMAP).catch((e) => ({ error: String(e).slice(0, 300) }));
    const afterSent = result.t0 ? sent.filter((s) => s.t >= result.t0) : [];
    const byLayer = {}; for (const s of afterSent) byLayer[s.layer] = (byLayer[s.layer] || 0) + 1;
    const errorsDuringRefresh = result.t0 ? errs.filter((e) => e.t >= result.t0).map((e) => e.layer) : [];
    delete result.t0; delete result.before;
    console.log(JSON.stringify({ load: i, ...result, requestsDuringRefresh: byLayer, errorsDuringRefresh }));
    await ctx.close();
  }
  await b.close();
})();
