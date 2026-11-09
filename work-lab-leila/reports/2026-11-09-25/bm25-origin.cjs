// Batch 25 (#2785): are the basemap's tile queries sent from the page or from a web worker?
const { chromium } = require('/w/node_modules/playwright');
const BASEMAP = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer';
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 950 } })).newPage();
  const seen = { page: 0, worker: 0 }; let workers = 0;
  p.on('worker', () => workers++);
  p.on('request', (req) => {
    if (!req.url().startsWith(BASEMAP) || !/\/query\?/.test(req.url())) return;
    try { req.frame(); seen.page++; } catch { seen.worker++; }
  });
  await p.goto('https://aggiemap.tamu.edu/map/d', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 120000 }).catch(() => {});
  await p.waitForTimeout(5000);
  console.log(JSON.stringify({ basemapQueries: seen, workersStarted: workers }));
  await b.close();
})();
