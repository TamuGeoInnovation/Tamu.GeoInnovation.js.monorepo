// Records #2282's moved animations: a Playwright video per app and a 10 ms sample of each moving element's computed
// style, for one state (before or after). Usage: node record.cjs <state> <dist root> <out dir>
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/w/node_modules/playwright');

const [state, distRoot, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

function serve(root, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      let file = path.join(root, url);
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(port, () => resolve(server));
  });
}

// Samples the given selectors' computed styles every 10 ms for `ms`, while `act` runs.
async function sample(page, name, selectors, act, ms = 900) {
  await page.evaluate(
    ({ selectors, ms }) => {
      window.__frames = [];
      const t0 = performance.now();
      const id = setInterval(() => {
        const t = Math.round(performance.now() - t0);
        const row = { t };
        for (const [label, sel] of Object.entries(selectors)) {
          const el = document.querySelector(sel);
          if (!el) {
            row[label] = null;
            continue;
          }
          const cs = getComputedStyle(el);
          row[label] = { transform: cs.transform, opacity: cs.opacity, width: cs.width, maxHeight: cs.maxHeight, height: cs.height };
        }
        window.__frames.push(row);
        if (t > ms) clearInterval(id);
      }, 10);
    },
    { selectors, ms }
  );
  await act();
  await page.waitForTimeout(ms / 2);
  await page.screenshot({ path: path.join(outDir, `${name}-${state}.png`) });
  await page.waitForTimeout(ms / 2 + 150);
  return page.evaluate(() => window.__frames);
}

const bars = { top: 'tamu-gisc-hamburger-trigger .burger__top-bun', patty: 'tamu-gisc-hamburger-trigger .burger__patty', bottom: 'tamu-gisc-hamburger-trigger .burger__bottom-bun' };
const menu = { menu: 'tamu-gisc-tile-navigation .menu-host', tiles: 'tamu-gisc-tile-navigation .tiles', firstTile: 'tamu-gisc-tile-navigation .tiles tamu-gisc-tile:first-child', lastTile: 'tamu-gisc-tile-navigation .tiles tamu-gisc-tile:last-child', submenu: 'tamu-gisc-tile-navigation tamu-gisc-tile-submenu-container' };

async function phoneMenu(browser, app, port, withSubmenu) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, timezoneId: 'America/Chicago', recordVideo: { dir: path.join(outDir, 'video-tmp'), size: { width: 390, height: 844 } } });
  const page = await context.newPage();
  // Geoservices' one-time welcome modal and banner, acknowledged, as a returning visitor has them.
  await page.addInitScript(() => localStorage.setItem('user-preferences', JSON.stringify({ modals: { reskin_acknowledge: true }, banners: { reskin_banner_acknowledge: true } })));
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && /NG0/.test(m.text()) && errors.push(m.text()));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
  await page.waitForSelector('tamu-gisc-hamburger-trigger', { timeout: 30000 });
  await page.waitForTimeout(1500);
  const frames = {};
  frames.menuOpen = await sample(page, `${app}-menu-open`, { ...bars, ...menu }, () => page.click('tamu-gisc-hamburger-trigger'), 1200);
  if (withSubmenu) {
    frames.submenuOpen = await sample(page, `${app}-submenu-open`, menu, () => page.click('tamu-gisc-tile-navigation .tiles tamu-gisc-tile:first-child'));
    const row = { row: 'tamu-gisc-tile-navigation .submenu__row:first-child .row__content' };
    frames.rowExpand = await sample(page, `${app}-row-expand`, row, () => page.click('tamu-gisc-tile-navigation .submenu__row:first-child .row__title'));
    frames.rowCollapse = await sample(page, `${app}-row-collapse`, row, () => page.click('tamu-gisc-tile-navigation .submenu__row:first-child .row__title'));
  }
  frames.menuClose = await sample(page, `${app}-menu-close`, { ...bars, ...menu }, () => page.click('tamu-gisc-hamburger-trigger'));
  frames.ngErrors = errors;
  const video = page.video();
  await context.close();
  fs.renameSync(await video.path(), path.join(outDir, `${app}-phone-menu-${state}.webm`));
  return frames;
}

// The interactive geocoding form and its result: a made-up result in the page's own cache, then its Reset.
async function forms(browser, port) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Chicago', recordVideo: { dir: path.join(outDir, 'video-tmp'), size: { width: 1280, height: 900 } } });
  const page = await context.newPage();
  // Geoservices' one-time welcome modal and banner, acknowledged, as a returning visitor has them.
  await page.addInitScript(() => localStorage.setItem('user-preferences', JSON.stringify({ modals: { reskin_acknowledge: true }, banners: { reskin_banner_acknowledge: true } })));
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && /NG0/.test(m.text()) && errors.push(m.text()));
  const cache = { form: {}, result: { message: 'Success', data: { transactionGuid: '00000000-0000-0000-0000-000000000000', timeTaken: 12, results: [] } } };
  await page.addInitScript((c) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('geoservices', JSON.stringify({ 'interactive-cache': c }));
      sessionStorage.setItem('seeded', '1');
    }
  }, cache);
  const card = { box: '.card > div' };
  await page.goto(`http://127.0.0.1:${port}/services/geocoding`, { waitUntil: 'load' });
  await page.waitForSelector('#action-links', { timeout: 30000 });
  await page.waitForTimeout(1000);
  const frames = {};
  frames.resetResultLeaves = await sample(page, 'geoservices-form-reset', { first: '.card > div:first-child', last: '.card > div:last-child' }, () => page.click('#action-links .action-link:first-child'), 800);
  frames.ngErrors = errors;
  const video = page.video();
  await context.close();
  fs.renameSync(await video.path(), path.join(outDir, `geoservices-form-${state}.webm`));
  return frames;
}

(async () => {
  const geo = await serve(path.join(distRoot, 'geoservices-angular'), 4301);
  const gis = await serve(path.join(distRoot, 'gisday-angular'), 4302);
  const browser = await chromium.launch();
  const only = process.argv[5];
  const result = only === 'form' ? { state } : { state, geoservices: await phoneMenu(browser, 'geoservices', 4301, true), gisday: await phoneMenu(browser, 'gisday', 4302, false) };
  try {
    result.geoservicesForm = await forms(browser, 4301);
  } catch (e) {
    result.geoservicesForm = { error: String(e).slice(0, 300) };
  }
  await browser.close();
  geo.close();
  gis.close();
  fs.rmSync(path.join(outDir, 'video-tmp'), { recursive: true, force: true });
  fs.writeFileSync(path.join(outDir, `frames-${state}${only ? '-' + only : ''}.json`), JSON.stringify(result, null, 1) + '\n');
  console.log('recorded', state);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
