const { chromium } = require('/w/node_modules/playwright');
const fs = require('fs');
(async () => { const b = await chromium.launch(); const out = [];
  const worker = async (w) => { for (let i = w; i <= Number(process.env.N || 30); i += 3) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } }); const page = await ctx.newPage();
    await page.route(/google-analytics|googletagmanager/, (r) => r.abort());
    const bad = [];
    page.on('response', async (r) => { const m = /TAMU_Basemap_20261008\/MapServer\/(\d+)\/query/.exec(r.url()); if (!m) return; let x = r.status() >= 400; if (!x) { try { x = /"error"\s*:/.test((await r.text()).slice(0, 200)); } catch {} } if (x) bad.push(m[1]); });
    await page.goto('https://aggiemap.tamu.edu/map/d');
    try { await page.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true && window.__tamuGiscMapProbe.drawing === false, null, { timeout: 90000, polling: 500 }); } catch {}
    await page.waitForTimeout(2000);
    const res = {};
    for (const num of ['1530', '1544']) {
      const at = await page.evaluate(async (num) => { const v = document.querySelector('arcgis-map').view; const l = v.map.allLayers.find((x) => x.id === 'buildings-layer'); const lv = v.allLayerViews.find((x) => x.layer === l); const q = l.createQuery(); q.where = `Number='${num}'`; q.returnGeometry = true; q.outSpatialReference = v.spatialReference; const f = (await l.queryFeatures(q)).features[0]; const s = v.toScreen(f.geometry.centroid); const qv = lv.createQuery(); qv.where = `Number='${num}'`; const inView = await lv.queryFeatureCount(qv); return { x: s.x, y: s.y, inView }; }, num);
      await page.mouse.click(at.x, at.y);
      let p = 'none'; const end = Date.now() + 8000;
      while (Date.now() < end) { p = await page.evaluate((num) => { const p = document.querySelector('tamu-gisc-feature-popup .popup'); return p && !p.classList.contains('hidden') && p.innerText.includes('Building ' + num) ? 'right' : 'none'; }, num); if (p === 'right') break; await page.waitForTimeout(200); }
      res[num] = { inView: at.inView, popup: p };
    }
    const rec = { load: i, failed: bad, res }; out.push(rec); console.log(JSON.stringify(rec)); await ctx.close(); } };
  await Promise.all([1, 2, 3].map(worker)); fs.writeFileSync('/out/failclick.json', JSON.stringify(out)); await b.close(); })();
