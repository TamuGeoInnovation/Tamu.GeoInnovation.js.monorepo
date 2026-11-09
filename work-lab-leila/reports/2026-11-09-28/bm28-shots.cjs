// Batch 28: production's bus routes, before and after: the desktop tabs and the bus panel.
const { chromium } = require('/w/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1280, height: 950 }, timezoneId: 'America/Chicago' })).newPage();
  await p.route(/google-analytics|googletagmanager/, (r) => r.abort());
  const busQueries = []; p.on('request', (r) => { if (/Bus_Routes_view/.test(r.url())) busQueries.push(new URL(r.url()).host); });
  await p.goto(`${process.env.BASE}/map/d/bus`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 180000 }).catch(() => {});
  await p.waitForTimeout(6000);
  const tabs = await p.locator('tamu-gisc-sidebar-tab').evaluateAll((els) => els.map((e) => e.getAttribute('ng-reflect-title') || e.textContent.trim()).filter(Boolean)).catch(() => []);
  const notice = await p.locator('.bus-routes-notice').count();
  const routes = await p.locator('tamu-gisc-bus-route').count();
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  console.log(JSON.stringify({ base: process.env.BASE, url: p.url(), notice, routes, busQueryHosts: [...new Set(busQueries)], busQueries: busQueries.length }));
  await b.close();
})();
