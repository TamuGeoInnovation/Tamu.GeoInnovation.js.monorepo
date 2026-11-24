// PR 3401: does GIS Day's competition map (maplibre-gl) draw its basemap, and does geoservices' code highlighting
// (highlight.js) still colour its samples? Usage: node probe3401.cjs <label> <dist root> <out dir>
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/w/node_modules/playwright');

const [label, distRoot, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

function serve(root, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(port, () => resolve(server));
  });
}

(async () => {
  const gis = await serve(path.join(distRoot, 'gisday-angular'), 4402);
  const geo = await serve(path.join(distRoot, 'geoservices-angular'), 4401);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const out = { label };

  for (const route of ['/competitions/sidewalk']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Chicago' });
    const errors = [];
    const tiles = { ok: 0, failed: 0 };
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('response', (r) => {
      if (/\/tile\/|\.pbf|VectorTileServer/.test(r.url())) r.status() < 400 ? tiles.ok++ : tiles.failed++;
    });
    await page.goto(`http://127.0.0.1:4402${route}`, { waitUntil: 'load' });
    const canvas = await page.waitForSelector('.maplibregl-canvas', { timeout: 20000 }).catch(() => null);
    if (!canvas) {
      out[route] = { canvas: false, url: page.url(), errors };
      await page.close();
      continue;
    }
    await page.waitForTimeout(12000);
    await canvas.scrollIntoViewIfNeeded();
    const shot = path.join(outDir, `gisday-sidewalk-map-${label}.png`);
    await canvas.screenshot({ path: shot });
    // Distinct colours in the canvas: a blank map is one or two, a drawn basemap many.
    const colours = await page.evaluate(() => {
      const c = document.querySelector('.maplibregl-canvas');
      const copy = document.createElement('canvas');
      copy.width = 200;
      copy.height = 100;
      const ctx = copy.getContext('2d');
      ctx.drawImage(c, 0, 0, 200, 100);
      const d = ctx.getImageData(0, 0, 200, 100).data;
      const seen = new Set();
      for (let i = 0; i < d.length; i += 4) seen.add(`${d[i] >> 3},${d[i + 1] >> 3},${d[i + 2] >> 3}`);
      return seen.size;
    });
    out[route] = { canvas: true, url: page.url(), tiles, colours, errors };
    await page.close();
    break;
  }

  for (const route of ['/docs/getting-started', '/docs/geocoding']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.addInitScript(() => localStorage.setItem('user-preferences', JSON.stringify({ modals: { reskin_acknowledge: true }, banners: { reskin_banner_acknowledge: true } })));
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await page.goto(`http://127.0.0.1:4401${route}`, { waitUntil: 'load' });
    await page.waitForTimeout(10000);
    const hl = await page.evaluate(() => ({ blocks: document.querySelectorAll('code.hljs, .hljs').length, tokens: document.querySelectorAll('[class^="hljs-"], [class*=" hljs-"]').length }));
    out[route] = { ...hl, errors };
    if (hl.blocks) {
      await page.locator('.hljs').first().scrollIntoViewIfNeeded();
      await page.locator('.hljs').first().screenshot({ path: path.join(outDir, `geoservices-code-${label}.png`) });
    }
    await page.close();
    if (hl.blocks) break;
  }

  await browser.close();
  gis.close();
  geo.close();
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
