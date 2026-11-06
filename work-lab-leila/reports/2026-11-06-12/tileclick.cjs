// On a production load where a buildings-layer (layer 1) query failed: pan the failed tile to the middle, then click a
// building the service has there but the layer view lost, and one it kept. Does the lost one still open a popup?
const { chromium } = require('/w/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const results = [];
  for (let i = 1; i <= Number(process.env.MAX || 40) && results.length < Number(process.env.WANT || 3); i++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } });
    const page = await ctx.newPage();
    await page.route(/google-analytics|googletagmanager/, (r) => r.abort());
    const bad = [];
    page.on('response', async (r) => {
      const m = /TAMU_Basemap_20261008\/MapServer\/1\/query\?(.*)$/.exec(r.url()); if (!m) return;
      let x = r.status() >= 400; if (!x) { try { x = /"error"\s*:/.test((await r.text()).slice(0, 200)); } catch {} }
      if (x) bad.push(new URLSearchParams(m[1]).get('geometry'));
    });
    await page.goto('https://aggiemap.tamu.edu/map/d');
    try { await page.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true && window.__tamuGiscMapProbe.drawing === false, null, { timeout: 90000, polling: 500 }); } catch {}
    await page.waitForTimeout(2000);
    if (!bad.length) { console.log(`load ${i}: no buildings query failed`); await ctx.close(); continue; }
    const pick = await page.evaluate(async (gs) => {
      const g = JSON.parse(gs); const v = document.querySelector('arcgis-map').view;
      const p = v.center.clone(); p.x = (g.xmin + g.xmax) / 2; p.y = (g.ymin + g.ymax) / 2;
      await v.goTo({ center: p, zoom: v.zoom }, { animate: false });
      // Put the tile's middle in the middle of the part of the map the sidebar does not cover (x 0 to 920).
      await v.goTo({ center: v.toMap({ x: v.width / 2 + (v.width / 2 - 460), y: v.height / 2 }), zoom: v.zoom }, { animate: false });
      await new Promise((r) => setTimeout(r, 1500));
      for (let t = 0; t < 120 && window.__tamuGiscMapProbe.drawing !== false; t++) await new Promise((r) => setTimeout(r, 500));
      await new Promise((r) => setTimeout(r, 2000));
      const layer = v.map.allLayers.find((l) => l.id === 'buildings-layer'); const lv = v.allLayerViews.find((x) => x.layer === layer);
      const ext = { type: 'extent', xmin: g.xmin, ymin: g.ymin, xmax: g.xmax, ymax: g.ymax, spatialReference: g.spatialReference || v.spatialReference };
      const qs = layer.createQuery(); qs.geometry = ext; qs.outFields = ['OBJECTID', 'Number', 'BldgName']; qs.returnGeometry = true; qs.outSpatialReference = v.spatialReference;
      const server = (await layer.queryFeatures(qs)).features;
      const qv = lv.createQuery(); qv.geometry = ext; qv.outFields = ['OBJECTID'];
      const kept = new Set((await lv.queryFeatures(qv)).features.map((f) => f.attributes.OBJECTID));
      const box = document.querySelector('arcgis-map').getBoundingClientRect();
      const candidates = server.map((f) => {
        const c = f.geometry.centroid; const inTile = c.x > g.xmin && c.x < g.xmax && c.y > g.ymin && c.y < g.ymax;
        const s = v.toScreen(c); const area = f.geometry.extent.width * f.geometry.extent.height;
        return { name: (f.attributes.BldgName || '').trim(), num: f.attributes.Number, kept: kept.has(f.attributes.OBJECTID), inTile, x: s && box.left + s.x, y: s && box.top + s.y, area };
      }).filter((c) => c.x > 60 && c.y > 60 && c.x < 900 && c.y < 780 && c.name).sort((a, b) => b.area - a.area);
      const qo = layer.createQuery(); qo.geometry = v.extent; qo.outFields = ['OBJECTID', 'Number', 'BldgName']; qo.returnGeometry = true; qo.outSpatialReference = v.spatialReference; qo.num = 300;
      const outside = (await layer.queryFeatures(qo)).features.map((f) => { const c = f.geometry.centroid; const s = v.toScreen(c); return { name: (f.attributes.BldgName || '').trim(), num: f.attributes.Number, kept: 'outside the failed tile', inTile: false, x: s && box.left + s.x, y: s && box.top + s.y, area: f.geometry.extent.width * f.geometry.extent.height, cx: c.x, cy: c.y }; }).filter((c) => c.name && c.x > 60 && c.y > 60 && c.x < 900 && c.y < 780 && (c.cx < g.xmin - 50 || c.cx > g.xmax + 50 || c.cy < g.ymin - 50 || c.cy > g.ymax + 50)).sort((a, b) => b.area - a.area);
      const inT = candidates.filter((c) => c.inTile);
      return { lost: inT.filter((c) => !c.kept).slice(0, 2), kept: inT.filter((c) => c.kept).slice(0, 1), outside: outside.slice(0, 2), counts: [kept.size, server.length] };
    }, bad[0]);
    const clickOne = async (c) => {
      await page.evaluate(() => document.querySelector('tamu-gisc-feature-popup .popup')?.classList.add('hidden'));
      const hits = await page.evaluate(async ({ x, y }) => { const v = document.querySelector('arcgis-map').view; const h = await v.hitTest({ x, y }); return h.results.map((r) => r.layer && r.layer.id).filter((id) => id && !/-layer-0$/.test(id)).slice(0, 3); }, c);
      await page.mouse.click(c.x, c.y);
      const end = Date.now() + 10000; let txt = null;
      while (Date.now() < end) { txt = await page.evaluate(() => { const p = document.querySelector('tamu-gisc-feature-popup .popup'); return p && !p.classList.contains('hidden') ? p.innerText.replace(/\s+/g, ' ') : null; }); if (txt && txt.includes(c.name)) break; await page.waitForTimeout(200); }
      return { building: `${c.name} (${c.num})`, kept: c.kept, hits, popup: txt ? (txt.includes(c.name) ? 'right' : 'other: ' + txt.slice(6, 60)) : 'none' };
    };
    const r = { load: i, viewKept: pick.counts[0], serverHas: pick.counts[1], clicks: [] };
    // The sidebar holds the popup; show it again for the clicks.
    for (const c of [...pick.outside.slice(0, 1), ...pick.kept, ...pick.lost, ...pick.outside.slice(1, 2)]) r.clicks.push(await clickOne(c));
    await page.screenshot({ path: `/out/tileclick-${i}.png` });
    console.log(`load ${i}: ${JSON.stringify(r)}`);
    results.push(r);
    await ctx.close();
  }
  await b.close();
})();
