// Walk every map in the smoke manifest and record each layer's symbology source, as the map probe
// reports it (#1578). Writes JSON; generate.py turns it into docs/layer-symbology.md.
// Run in the Playwright container (see README.md): node collect.js <baseUrl> <manifest.json> <out.json>
const fs = require('fs');
const { chromium } = require('@playwright/test');

(async () => {
  const [baseUrl, manifestPath, out] = process.argv.slice(2);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const browser = await chromium.launch();
  const results = [];

  for (const mapPath of manifest.maps) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, timezoneId: 'America/Chicago' });
    let layers = null;
    let note = '';

    try {
      await page.goto(baseUrl + mapPath, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => window.__tamuGiscMapProbe !== undefined, null, { timeout: 60000 });
      // Wait for every layer to settle, as maps.spec does, but give up after 90 s and record what is there.
      try {
        await page.waitForFunction(() => window.__tamuGiscMapProbe.ready === true, null, { timeout: 90000, polling: 1000 });
      } catch {
        note = 'probe never reported ready; layers as they stood after 90 s';
      }
      const snapshot = await page.evaluate(() => window.__tamuGiscMapProbe.snapshot());
      const renderers = await page.evaluate(() => window.__tamuGiscMapProbe.renderers());
      layers = snapshot.layers.map((l) => ({ id: l.id, title: l.title, type: l.type, visible: l.visible, loaded: l.loaded, symbology: l.symbology, renderer: renderers[l.id] ?? null }));
    } catch (e) {
      note = 'did not load: ' + String(e.message || e).split('\n')[0];
    }

    results.push({ mapPath, note, layers });
    console.log(mapPath, layers ? layers.length + ' layers' : note);
    await page.close();
  }

  fs.writeFileSync(out, JSON.stringify({ baseUrl, collected: new Date().toISOString(), maps: results }, null, 2));
  await browser.close();
})();
