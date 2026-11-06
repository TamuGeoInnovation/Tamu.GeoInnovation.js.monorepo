// #2707: how often a click on the main map answers, against time since load. Fresh context per load; the target is
// clicked where the view puts its own coordinates at the moment of the click (view.toScreen), re-read per load.
// MODE=popup: /map/d, one of two buildings per load, popup right / wrong / none.
// MODE=trip: /map/d/trip, a stop set by building name / by coordinates / none.
// MODE=first: /map/d, click every second from load until the right popup opens (when a click first works).
// NATURE=1 turns the Nature Rx layer on as soon as it exists. TOGGLE=1 waits for settled, turns it on, then clicks
// at the delay after the toggle. TARGET=nature clicks a Nature Rx marker in the view instead of a building.
const { chromium } = require('/w/node_modules/playwright');
const fs = require('fs');

const ENV = process.env.ENV;
const MODE = process.env.MODE || 'popup';
const DELAYS = (process.env.DELAYS || '0,1,2,4,8,16,settled').split(',');
const N = Number(process.env.N || 20);
const PAR = Number(process.env.PAR || 4);
const NATURE = process.env.NATURE === '1';
const TOGGLE = process.env.TOGGLE === '1';
const OUT = process.env.OUT;
const TARGETS = [
  { name: 'Interdisciplinary Life Sciences Building', lon: -96.343611, lat: 30.61429, fallback: { x: 739, y: 342 } },
  { name: 'Gene Stallings Blvd Garage', lon: -96.343424, lat: 30.611518, fallback: { x: 756, y: 642 } }
];

// Records, in the page's own clock, when the probe first says ready and when drawing first stops after that, and
// turns Nature Rx on as soon as the layer exists when asked to.
const INIT = `
  window.__b11 = { ready: null, drawn: null, view: null, natureOn: null, readyLog: [], drawingLog: [] };
  const t0 = setInterval(() => {
    const p = window.__tamuGiscMapProbe, s = window.__b11, now = Math.round(performance.now());
    if (p) {
      const r = p.ready === true, d = p.drawing === true;
      if (!s.readyLog.length || s.readyLog[s.readyLog.length - 1][1] !== r) s.readyLog.push([now, r]);
      if (!s.drawingLog.length || s.drawingLog[s.drawingLog.length - 1][1] !== d) s.drawingLog.push([now, d]);
    }
    if (now > 60000) clearInterval(t0);
  }, 100);
  const t = setInterval(() => {
    const p = window.__tamuGiscMapProbe, s = window.__b11;
    const v = document.querySelector('arcgis-map')?.view;
    if (v && v.ready && s.view === null) s.view = performance.now();
    if (p && p.ready === true && s.ready === null) s.ready = performance.now();
    if (s.ready !== null && p && p.drawing === false && s.drawn === null) s.drawn = performance.now();
    if (${NATURE} && v && s.natureOn === null) {
      const l = v.map?.allLayers?.find((x) => x.id === 'nature-rx-layer');
      if (l) { l.visible = true; s.natureOn = performance.now(); }
    }
    if (s.drawn !== null && (!${NATURE} || s.natureOn !== null)) clearInterval(t);
  }, 50);
`;

async function settled(page) {
  await page.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 90000, polling: 250 });
  let last = null, since = Date.now();
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    const f = await page.evaluate(() => { const x = window.__tamuGiscMapProbe.framing; return x ? JSON.stringify([+x.zoom.toFixed(2), +x.center[0].toFixed(5), +x.center[1].toFixed(5)]) : null; });
    if (f !== last) { last = f; since = Date.now(); } else if (Date.now() - since >= 1000) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

// Where to click for a target, in page coordinates, or why it cannot be clicked.
async function screenFor(page, target) {
  return await page.evaluate((tg) => {
    const el = document.querySelector('arcgis-map');
    const view = el?.view;
    if (!view || !view.ready || !view.center) return { why: 'no view' };
    let pt;
    if (tg.nature) {
      const lv = view.allLayerViews?.find((x) => x.layer.id === 'nature-rx-layer');
      return { why: 'nature-async' };
    }
    pt = view.center.clone(); pt.longitude = tg.lon; pt.latitude = tg.lat;
    const s = view.toScreen(pt);
    if (!s) return { why: 'toScreen null' };
    const box = el.getBoundingClientRect();
    const x = box.left + s.x, y = box.top + s.y;
    const hit = document.elementFromPoint(x, y);
    if (hit && hit.closest('.loader')) return { x, y, under: 'loader' };
    if (!hit || !(hit === el || el.contains(hit))) return { why: 'covered or outside: ' + (hit ? hit.tagName + '.' + hit.className : 'nothing'), x, y };
    return { x, y };
  }, target);
}

// A Nature Rx marker in the visible part of the view, from the layer's own features.
async function natureTarget(page) {
  return await page.evaluate(async () => {
    const el = document.querySelector('arcgis-map'); const view = el?.view;
    if (!view || !view.ready) return null;
    const layer = view.map.allLayers.find((x) => x.id === 'nature-rx-layer');
    if (!layer) return null;
    const q = layer.createQuery(); q.geometry = view.extent; q.outFields = ['*']; q.returnGeometry = true; q.outSpatialReference = { wkid: 4326 };
    const r = await layer.queryFeatures(q);
    const box = el.getBoundingClientRect();
    for (const f of r.features) {
      const pt = view.center.clone(); pt.longitude = f.geometry.longitude; pt.latitude = f.geometry.latitude;
      const s = view.toScreen(pt); if (!s) continue;
      const hit = document.elementFromPoint(box.left + s.x, box.top + s.y);
      if (hit && el.contains(hit)) {
        const a = f.attributes; const name = Object.entries(a).find(([k, v]) => /name/i.test(k) && typeof v === 'string')?.[1];
        return { name: (name || '').trim(), lon: f.geometry.longitude, lat: f.geometry.latitude };
      }
    }
    return null;
  });
}

async function readPopup(page) {
  return await page.evaluate(() => {
    const p = document.querySelector('tamu-gisc-feature-popup .popup');
    if (!p || p.classList.contains('hidden')) return null;
    return p.innerText.replace(/\s+/g, ' ').trim().slice(0, 160);
  });
}

async function readTrip(page) {
  return await page.evaluate(() => {
    const view = document.querySelector('arcgis-map')?.view;
    const layer = view?.map?.allLayers?.find((x) => x.id === 'trip-points-layer');
    const inputs = [...document.querySelectorAll('tamu-gisc-sidebar-trip-planner tamu-gisc-search input')].map((i) => i.value);
    return { graphics: layer ? layer.graphics.length : null, inputs };
  });
}

async function oneLoad(browser, delay, i) {
  const target = { ...TARGETS[i % 2] };
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 }, timezoneId: 'America/Chicago' });
  const page = await ctx.newPage();
  await page.route(/google-analytics|googletagmanager/, (r) => r.abort());
  await page.addInitScript(INIT);
  const rec = { env: ENV, mode: MODE, delay, i, nature: NATURE, toggle: TOGGLE, target: target.name };
  try {
    const path = MODE === 'trip' ? '/map/d/trip' : '/map/d';
    await page.goto(ENV + path, { waitUntil: 'load', timeout: 90000 });
    rec.load = await page.evaluate(() => Math.round(performance.getEntriesByType('navigation')[0].loadEventEnd));
    if (MODE === 'first') {
      // Click the target every 2 s from the load event; each click gets 2 s to open the right popup.
      rec.clicks = [];
      const stop = Date.now() + 90000;
      while (Date.now() < stop) {
        const at = await screenFor(page, target);
        const t = Math.round(await page.evaluate(() => performance.now()));
        if (!('x' in at)) { rec.clicks.push([t, at.why]); await page.waitForTimeout(2000); continue; }
        await page.mouse.click(at.x, at.y);
        const until = Date.now() + 2000; let p = null;
        while (Date.now() < until) { p = await readPopup(page); if (p && p.includes(target.name)) break; await page.waitForTimeout(100); }
        const ok = !!(p && p.includes(target.name));
        rec.clicks.push([t, at.under ? 'under loader: ' + (ok ? 'right' : p ? 'other' : 'none') : ok ? 'right' : p ? 'other' : 'none']);
        if (ok) { rec.firstRight = t; rec.popupSeen = Math.round(await page.evaluate(() => performance.now())); break; }
      }
      const marks = await page.evaluate(() => window.__b11);
      Object.assign(rec, { view: marks.view && Math.round(marks.view), ready: marks.ready && Math.round(marks.ready), drawn: marks.drawn && Math.round(marks.drawn) });
      if (process.env.HOLD) await page.waitForTimeout(Math.max(0, 60000 - (rec.popupSeen || 60000)));
      const logs = await page.evaluate(() => ({ r: window.__b11.readyLog, d: window.__b11.drawingLog }));
      rec.readyLog = logs.r; rec.drawingLog = logs.d;
      rec.result = rec.firstRight ? 'worked' : 'never in 90 s';
      return rec;
    }
    if (TOGGLE && process.env.AFTER === 'drawn') await page.waitForFunction(() => window.__b11.drawn !== null, null, { timeout: 120000, polling: 100 });
    else if (delay === 'settled' || TOGGLE) rec.settled = await settled(page);
    else if (delay === 'drawn') await page.waitForFunction(() => window.__b11.drawn !== null, null, { timeout: 120000, polling: 100 });
    else await page.waitForTimeout(Number(delay) * 1000);
    if (TOGGLE) {
      rec.toggleAt = await page.evaluate(() => { const v = document.querySelector('arcgis-map').view; v.map.allLayers.find((x) => x.id === 'nature-rx-layer').visible = true; return Math.round(performance.now()); });
      if (delay !== 'settled' && delay !== 'drawn') await page.waitForTimeout(Number(delay) * 1000);
    }
    if (process.env.TARGET === 'nature') {
      const n = await natureTarget(page);
      if (!n) { rec.result = 'unusable'; rec.why = 'no nature marker visible'; return rec; }
      Object.assign(target, n, { nature: false }); rec.target = 'Nature Rx: ' + n.name;
    }
    let at = await screenFor(page, target);
    if (!('x' in at) || at.why) {
      rec.why = at.why;
      if (at.why === 'no view' && MODE !== 'first') { rec.result = 'no view yet'; at = target.fallback; } else { rec.result = 'unusable'; return rec; }
    }
    if (at.under) rec.under = at.under;
    if (process.env.DIAG) rec.diag = await page.evaluate(async ({ x, y }) => {
      const el = document.querySelector('arcgis-map'); const v = el?.view; if (!v || !v.ready) return 'no view';
      const b = el.getBoundingClientRect();
      const lv = v.allLayerViews.find((l) => l.layer.id === 'buildings-layer');
      const h = await v.hitTest({ x: x - b.left, y: y - b.top });
      return { hits: h.results.map((r) => r.layer?.id || r.type).slice(0, 5), buildingsView: lv ? { updating: lv.updating, suspended: lv.suspended } : null, viewUpdating: v.updating, stationary: v.stationary };
    }, at);
    rec.clickAt = Math.round(await page.evaluate(() => performance.now()));
    await page.mouse.click(at.x, at.y);
    const end = Date.now() + (MODE === 'trip' ? 20000 : 20000);
    let got = null;
    while (Date.now() < end) {
      if (MODE === 'trip') {
        const t = await readTrip(page);
        if (t.graphics > 0 || t.inputs.some((v) => v)) { got = t; await page.waitForTimeout(500); got = await readTrip(page); break; }
      } else {
        const p = await readPopup(page);
        if (p) {
          rec.answeredAt = Math.round(await page.evaluate(() => performance.now())) - rec.clickAt;
          // The popup opens before its sections fill; give them up to 3 s.
          const until = Date.now() + 3000; got = p;
          while (Date.now() < until && !/Building|Garage|Lot|Address|Directions/i.test(got.replace(/^closes*/, ''))) { await page.waitForTimeout(100); got = (await readPopup(page)) || got; }
          break;
        }
      }
      await page.waitForTimeout(100);
    }
    rec.answeredAfter = got && MODE !== 'trip' ? rec.answeredAt : got ? Math.round(await page.evaluate(() => performance.now())) - rec.clickAt : null;
    const marks = await page.evaluate(() => window.__b11);
    Object.assign(rec, { view: marks.view && Math.round(marks.view), ready: marks.ready && Math.round(marks.ready), drawn: marks.drawn && Math.round(marks.drawn), natureOn: marks.natureOn && Math.round(marks.natureOn) });
    const outcome = (() => {
      if (MODE === 'trip') {
        if (!got) return 'none';
        const v = got.inputs.find((x) => x) || '';
        rec.box = v; rec.graphics = got.graphics;
        if (target.name && v.includes(target.name.split(' ')[0]) && !/^-?\d/.test(v)) return 'named';
        if (/-?\d+\.\d+/.test(v)) return 'coordinates';
        return 'other: ' + v.slice(0, 60);
      }
      if (!got) return 'none';
      rec.popup = got;
      return got.includes(target.name) ? 'right' : 'wrong';
    })();
    rec.result = (rec.result === 'no view yet' ? 'no view yet: ' : rec.under ? 'under loader: ' : '') + outcome;
  } catch (e) {
    rec.result = 'error'; rec.why = String(e).split('\n')[0].slice(0, 120);
  } finally {
    await ctx.close().catch(() => {});
  }
  return rec;
}

(async () => {
  const browser = await chromium.launch();
  const jobs = [];
  for (const d of DELAYS) for (let i = 0; i < N; i++) jobs.push([d, i]);
  // Interleave the buckets so a slow minute on the server does not land on one delay.
  jobs.sort((a, b) => a[1] - b[1] || DELAYS.indexOf(a[0]) - DELAYS.indexOf(b[0]));
  const out = fs.createWriteStream(OUT, { flags: 'a' });
  let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => {
    while (next < jobs.length) {
      const [d, i] = jobs[next++];
      const rec = await oneLoad(browser, d, i);
      out.write(JSON.stringify(rec) + '\n');
      console.log(`${d}s #${i} ${rec.target.slice(0, 20)}: ${rec.result}${rec.why ? ' (' + rec.why + ')' : ''}`);
    }
  }));
  out.end();
  await browser.close();
})();
