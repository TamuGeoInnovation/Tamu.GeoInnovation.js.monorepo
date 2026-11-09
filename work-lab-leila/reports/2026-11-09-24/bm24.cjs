// #2702, batch 24: every request a main-map load sends to the campus basemap, with what came back.
// One JSON line per request (kind "req") and per load ("load") to OUT; failed queries are re-asked RETRY times.
const fs = require('fs');
const { chromium } = require('/w/node_modules/playwright');
const BASE = process.env.BASE || 'https://aggiemap.tamu.edu', LOADS = Number(process.env.LOADS || 10);
const RETRY = Number(process.env.RETRY || 3), OUT = process.env.OUT, RUN = process.env.RUN || 'run';
const BASEMAP = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';
const write = (o) => fs.appendFileSync(OUT, JSON.stringify({ run: RUN, ...o }) + '\n');

function describe(u) {
  const url = new URL(u), rest = url.pathname.slice(new URL(BASEMAP).pathname.length);
  const layer = rest.match(/^\/(\d+)/)?.[1] ?? null;
  const op = rest.replace(/^\/\d+/, '').replace(/^\//, '') || 'service';
  const p = url.searchParams;
  return {
    layer, op,
    countOnly: p.get('returnCountOnly') === 'true', idsOnly: p.get('returnIdsOnly') === 'true',
    geometry: p.has('geometry'), quantization: p.has('quantizationParameters'), f: p.get('f')
  };
}

(async () => {
  const b = await chromium.launch();
  for (let i = 1; i <= LOADS; i++) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 950 } });
    const p = await ctx.newPage();
    await p.route(/google-analytics|googletagmanager/, (r) => r.abort());
    const pending = [], failedUrls = [];
    const started = new Map();
    p.on('request', (req) => { if (req.url().startsWith(BASEMAP)) started.set(req, Date.now()); });
    p.on('requestfailed', (req) => {
      if (!req.url().startsWith(BASEMAP)) return;
      write({ kind: 'req', load: i, ...describe(req.url()), status: null, netError: req.failure()?.errorText ?? 'failed',
        ms: Date.now() - (started.get(req) ?? Date.now()), failed: true });
    });
    p.on('response', (res) => {
      const u = res.url(); if (!u.startsWith(BASEMAP)) return;
      const t0 = started.get(res.request()) ?? Date.now();
      pending.push(res.body().then((buf) => {
        const ms = Date.now() - t0, d = describe(u);
        let errorCode = null, errorMessage = null;
        const head = buf.subarray(0, 400).toString('utf8');
        const m = head.match(/"error"\s*:\s*\{\s*"code"\s*:\s*(\d+)\s*,\s*"message"\s*:\s*"([^"]*)"/);
        if (m) { errorCode = Number(m[1]); errorMessage = m[2]; }
        else if (/"error"\s*:/.test(head)) { errorCode = -1; errorMessage = head.slice(0, 120); }
        const failed = res.status() >= 400 || errorCode !== null;
        if (failed && d.op === 'query') failedUrls.push(u);
        write({ kind: 'req', load: i, ...d, url: d.op === 'query' ? u : undefined, status: res.status(), errorCode, errorMessage, bytes: buf.length, ms, failed,
          cache: res.headers()['x-cache'] ?? null });
      }).catch((e) => write({ kind: 'req', load: i, ...describe(u), status: res.status(), bodyError: String(e).slice(0, 80), failed: true })));
    });
    const t0 = Date.now();
    await p.goto(`${BASE}/map/d`, { waitUntil: 'domcontentloaded' });
    const ready = await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 120000 })
      .then(() => true).catch(() => false);
    await p.waitForTimeout(5000); await Promise.all(pending);
    write({ kind: 'load', load: i, ready, ms: Date.now() - t0, at: new Date().toISOString() });
    // Re-ask each failed query, outside the browser, to see whether the failure belongs to the request or the moment.
    for (const u of failedUrls) {
      const tries = [];
      for (let r = 0; r < RETRY; r++) {
        const res = await fetch(u).catch((e) => ({ status: 0, text: async () => String(e) }));
        const t = await res.text();
        tries.push(res.status === 200 && !/"error"\s*:/.test(t.slice(0, 400)) ? 'ok' : `fail:${res.status}`);
      }
      write({ kind: 'retry', load: i, ...describe(u), tries });
    }
    await ctx.close();
  }
  await b.close();
})();
