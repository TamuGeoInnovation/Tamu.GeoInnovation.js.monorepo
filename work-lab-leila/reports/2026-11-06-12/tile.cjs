// #2702, batch 12: catch a failed basemap query on screen. Loads production's main map in fresh contexts; per load
// records every query to TAMU_Basemap_20261008 layers 1, 2 and 9 with its tile envelope. When one fails, it waits for
// drawing to finish, photographs the map, outlines the failed tile, and asks the layer view how many features it holds
// in that envelope against what the service holds there. Stops after the first CAPTURES failed loads, and keeps one
// clean load to compare against.
const { chromium } = require('/w/node_modules/playwright');
const fs = require('fs');
const ENV = process.env.ENV || 'https://aggiemap.tamu.edu';
const MAX = Number(process.env.MAX || 40);
const CAPTURES = Number(process.env.CAPTURES || 3);
const ID = { 1: 'buildings-layer', 2: null, 9: 'surface-lots-layer' };

(async () => {
  const b = await chromium.launch();
  let caught = 0, clean = 0;
  const out = fs.createWriteStream('/out/tile.jsonl', { flags: 'a' });
  for (let i = 1; i <= MAX && (caught < CAPTURES || clean < 1); i++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 }, timezoneId: 'America/Chicago' });
    const page = await ctx.newPage();
    await page.route(/google-analytics|googletagmanager/, (r) => r.abort());
    const q = [];
    page.on('response', async (r) => {
      const m = /TAMU_Basemap_20261008\/MapServer\/(\d+)\/query\?(.*)$/.exec(r.url());
      if (!m) return;
      const p = new URLSearchParams(m[2]);
      let bad = r.status() >= 400, msg = bad ? 'HTTP ' + r.status() : null;
      if (!bad) { try { const t = await r.text(); const e = /"error"\s*:\s*\{[^}]*"message"\s*:\s*"([^"]*)"/.exec(t.slice(0, 400)); if (e) { bad = true; msg = e[1]; } } catch {} }
      q.push({ layer: m[1], bad, msg, geometry: p.get('geometry'), returnCount: p.get('returnCountOnly') });
    });
    await page.goto(ENV + '/map/d', { waitUntil: 'load' });
    let drawn = true;
    try {
      await page.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 90000 });
      await page.waitForFunction(() => window.__tamuGiscMapProbe.drawing === false, null, { timeout: 90000, polling: 500 });
    } catch { drawn = false; }
    await page.waitForTimeout(3000);
    const failed = q.filter((x) => x.bad && (x.layer === '1' || x.layer === '9'));
    const rec = { load: i, queries: q.length, failed: failed.map((f) => ({ layer: f.layer, msg: f.msg, geometry: f.geometry })), drawn };
    const tag = failed.length ? `fail-${String(i).padStart(2, '0')}` : clean < 1 && fs.existsSync('/out/tile-last-geometry.json') ? 'clean' : null;
    if (tag && (failed.length ? caught < CAPTURES : true)) {
      await page.screenshot({ path: `/out/tile-${tag}.png` });
      if (failed.length) {
        caught++;
        rec.tiles = await page.evaluate(async ({ failed, ID }) => {
          const el = document.querySelector('arcgis-map'); const view = el.view;
          const res = [];
          for (const f of failed) {
            let g; try { g = JSON.parse(f.geometry); } catch { res.push({ layer: f.layer, why: 'no envelope', geometry: (f.geometry || '').slice(0, 80) }); continue; }
            const sr = g.spatialReference || view.spatialReference;
            const corner = (x, y) => { const p = view.center.clone(); p.x = x; p.y = y; return view.toScreen(p); };
            const a = corner(g.xmin, g.ymax), c = corner(g.xmax, g.ymin);
            const r = { layer: f.layer, wkid: sr.wkid || sr.latestWkid, screen: a && c ? [Math.round(a.x), Math.round(a.y), Math.round(c.x), Math.round(c.y)] : null };
            const layer = view.map.allLayers.find((l) => l.url && l.url.includes('TAMU_Basemap') && (String(l.layerId) === f.layer || l.url.endsWith('/' + f.layer)));
            const id = layer && layer.id;
            if (layer) {
              const lv = view.allLayerViews.find((v) => v.layer === layer);
              const ext = { type: 'extent', xmin: g.xmin, ymin: g.ymin, xmax: g.xmax, ymax: g.ymax, spatialReference: sr };
              const qv = lv.createQuery(); qv.geometry = ext;
              const ql = layer.createQuery(); ql.geometry = ext;
              r.inView = await lv.queryFeatureCount(qv).catch((e) => 'err ' + e.message);
              r.onServer = await layer.queryFeatureCount(ql).catch((e) => 'err ' + e.message);
              r.layerId = id;
            } else r.layerId = 'not a map layer here';
            if (r.screen) {
              const d = document.createElement('div');
              const [x1, y1, x2, y2] = r.screen; const box = el.getBoundingClientRect();
              Object.assign(d.style, { position: 'fixed', left: box.left + Math.min(x1, x2) + 'px', top: box.top + Math.min(y1, y2) + 'px', width: Math.abs(x2 - x1) + 'px', height: Math.abs(y2 - y1) + 'px', border: '3px dashed #e00', zIndex: 99999, pointerEvents: 'none' });
              d.className = 'b12-outline'; document.body.appendChild(d);
            }
            res.push(r);
          }
          return res;
        }, { failed: failed.map((f) => ({ layer: f.layer, geometry: f.geometry })), ID });
        await page.screenshot({ path: `/out/tile-${tag}-outlined.png` });
        // Hide the sidebar and the notification (CSS only), and move the failed tile to the middle at the same zoom.
        await page.addStyleTag({ content: 'tamu-gisc-sidebar, tamu-gisc-notification-container, tamu-gisc-notification, .b12-outline { display: none !important; }' });
        const before = q.length;
        const g = JSON.parse(failed[0].geometry);
        await page.evaluate(async (g) => { const v = document.querySelector('arcgis-map').view; const p = v.center.clone(); p.x = (g.xmin + g.xmax) / 2; p.y = (g.ymin + g.ymax) / 2; await v.goTo({ center: p, zoom: v.zoom }, { animate: false }); }, g);
        await page.waitForTimeout(1500);
        await page.waitForFunction(() => window.__tamuGiscMapProbe.drawing === false, null, { timeout: 60000, polling: 500 }).catch(() => {});
        await page.waitForTimeout(2000);
        rec.afterPan = { newQueries: q.slice(before).map((x) => ({ layer: x.layer, bad: x.bad, sameTile: x.geometry === failed[0].geometry })) };
        rec.afterPan.counts = await page.evaluate(async ({ g, layerNo }) => { const v = document.querySelector('arcgis-map').view; const layer = v.map.allLayers.find((l) => l.url && l.url.includes('TAMU_Basemap') && String(l.layerId) === layerNo); const lv = v.allLayerViews.find((x) => x.layer === layer); const ext = { type: 'extent', ...g, spatialReference: g.spatialReference || v.spatialReference }; const a = lv.createQuery(); a.geometry = ext; const b = layer.createQuery(); b.geometry = ext; return { inView: await lv.queryFeatureCount(a), onServer: await layer.queryFeatureCount(b) }; }, { g, layerNo: failed[0].layer });
        await page.screenshot({ path: `/out/tile-${tag}-panned.png` });
        fs.writeFileSync('/out/tile-last-geometry.json', failed[0].geometry);
      } else {
        clean++;
        if (fs.existsSync('/out/tile-last-geometry.json')) {
          const g = JSON.parse(fs.readFileSync('/out/tile-last-geometry.json', 'utf8'));
          await page.addStyleTag({ content: 'tamu-gisc-sidebar, tamu-gisc-notification-container, tamu-gisc-notification { display: none !important; }' });
          await page.evaluate(async (g) => { const v = document.querySelector('arcgis-map').view; const p = v.center.clone(); p.x = (g.xmin + g.xmax) / 2; p.y = (g.ymin + g.ymax) / 2; await v.goTo({ center: p, zoom: v.zoom }, { animate: false }); }, g);
          await page.waitForTimeout(1500);
          await page.waitForFunction(() => window.__tamuGiscMapProbe.drawing === false, null, { timeout: 60000, polling: 500 }).catch(() => {});
          await page.waitForTimeout(2000);
          await page.screenshot({ path: '/out/tile-clean-panned.png' });
        }
      }
      rec.shot = tag;
    }
    out.write(JSON.stringify(rec) + '\n');
    console.log(`load ${i}: ${q.length} queries, ${failed.length} failed ${failed.map((f) => 'L' + f.layer).join(' ')} ${rec.tiles ? JSON.stringify(rec.tiles) : ''}`);
    await ctx.close();
  }
  out.end();
  await b.close();
})();
