// Measure a page's first load: what is downloaded, and when the page and the map are usable.
// node measure-load.js <url> <label> <runs> [mobile]
// Each run is a fresh browser context (empty cache). "mobile" emulates a mid-range phone on Fast 4G:
// 4x CPU slowdown, 1.6 Mbps down / 750 kbps up, 150 ms latency (Lighthouse's mobile preset).
const { chromium, devices } = require('@playwright/test');

const median = (xs) => {
  const s = xs.filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

(async () => {
  const [url, label, runsArg, mode] = process.argv.slice(2);
  const runs = Number(runsArg || 5);
  const mobile = mode === 'mobile';
  const browser = await chromium.launch();
  const results = [];

  for (let i = 0; i < runs; i++) {
    const context = await browser.newContext(
      mobile ? { ...devices['Pixel 7'], timezoneId: 'America/Chicago' } : { viewport: { width: 1600, height: 900 }, timezoneId: 'America/Chicago' }
    );
    const page = await context.newPage();

    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }

    await page.addInitScript(() => {
      window.__lcp = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__lcp = Math.max(window.__lcp, e.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    const started = Date.now();
    await page.goto(url, { waitUntil: 'load', timeout: 180000 });
    const loadMs = Date.now() - started;

    // The map probe says when every layer has settled: the map is usable.
    let readyMs = null;
    try {
      await page.waitForFunction(() => window.__tamuGiscMapProbe && window.__tamuGiscMapProbe.ready === true, null, { timeout: 180000, polling: 250 });
      readyMs = Date.now() - started;
    } catch {
      readyMs = null;
    }

    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource');
      const own = (r) => new URL(r.name).host === location.host;
      const js = res.filter((r) => /\.js(\?|$)/.test(r.name));
      const sum = (xs, k) => Math.round(xs.reduce((a, r) => a + (r[k] || 0), 0));
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
        fcp: fcp ? Math.round(fcp.startTime) : null,
        lcp: Math.round(window.__lcp),
        requests: res.length,
        ownJsFiles: js.filter(own).length,
        ownJsTransferKb: Math.round(sum(js.filter(own), 'transferSize') / 1024),
        ownJsDecodedKb: Math.round(sum(js.filter(own), 'decodedBodySize') / 1024),
        otherJsFiles: js.filter((r) => !own(r)).length,
        otherJsTransferKb: Math.round(sum(js.filter((r) => !own(r)), 'transferSize') / 1024),
        totalTransferKb: Math.round(sum(res, 'transferSize') / 1024)
      };
    });

    results.push({ loadMs, readyMs, ...m });
    console.error(`${label} run ${i + 1}: load ${loadMs} ms, ready ${readyMs} ms, LCP ${m.lcp} ms, own JS ${m.ownJsTransferKb} KB in ${m.ownJsFiles} files`);
    await context.close();
  }

  const keys = Object.keys(results[0]);
  const med = Object.fromEntries(keys.map((k) => [k, median(results.map((r) => r[k]))]));
  console.log(JSON.stringify({ label, url, mode: mobile ? 'mobile, Fast 4G, 4x CPU' : 'desktop, unthrottled', runs, median: med, all: results }));
  await browser.close();
})();
