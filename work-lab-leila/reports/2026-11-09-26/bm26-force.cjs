// Batch 26 (#2785): force one buildings tile query to fail as the service does (HTTP 200, error body), then click a
// building inside that tile once the map has settled. Records what the app does, and captures before/after images.
const { chromium } = require('/w/node_modules/playwright');
const BASE = process.env.BASE || 'http://aggiemap-dev:4200', SHOT = process.env.SHOT, LABEL = process.env.LABEL || 'run';
const BUILDINGS = 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_Basemap_20261008/MapServer/1/query';
const ERROR_BODY = JSON.stringify({ error: { code: 400, message: 'Invalid or missing input parameters.', details: [] } });

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 950 }, timezoneId: 'America/Chicago' });
  const p = await ctx.newPage();
  await p.route(/google-analytics|googletagmanager/, (r) => r.abort());
  let failedTile = null, buildingQueries = [];
  await p.route((url) => url.href.startsWith(BUILDINGS), async (route) => {
    const u = new URL(route.request().url());
    const isTile = u.searchParams.get('resultType') === 'tile';
    const g = isTile ? JSON.parse(u.searchParams.get('geometry')) : null;
    if (isTile && !failedTile && Math.abs(g.xmin - Number(process.env.TILE_X || -10725032)) < 5 && Math.abs(g.ymin - Number(process.env.TILE_Y || 3582145)) < 5) {
      failedTile = JSON.parse(u.searchParams.get('geometry'));
      return route.fulfill({ status: 200, contentType: 'application/json', body: ERROR_BODY });
    }
    if (!isTile) buildingQueries.push({ t: Date.now(), returnGeometry: u.searchParams.get('returnGeometry') });
    return route.continue();
  });
  // Every tile answer for every layer the click might ask, so a real failure in a control load is seen for what it is.
  const tileErrors = [];
  p.on('response', (res) => {
    const u = res.url();
    if (!/MapServer\/\d+\/query\?/.test(u) || !/resultType=tile/.test(u)) return;
    res.body().then((buf) => { if (/"error"\s*:/.test(buf.subarray(0, 300).toString())) tileErrors.push(u.match(/MapServer\/(\d+)/)[1]); }).catch(() => {});
  });
  await p.goto(`${BASE}/map/d`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__tamuGiscMapProbe?.ready === true, null, { timeout: 180000 });
  await p.waitForFunction(() => window.__tamuGiscMapProbe?.drawing === false, null, { timeout: 120000 });
  await p.waitForTimeout(3000);

  // A building whose centroid is in the failed tile and on screen, asked of the service from the page.
  const target = await p.evaluate(async (tile) => {
    const view = document.querySelector('arcgis-map').view;
    const layer = view.map.allLayers.find((l) => l.id === 'buildings-layer');
    const lv = view.allLayerViews.find((v) => v.layer === layer);
    const result = await layer.queryFeatures({
      geometry: { type: 'extent', ...tile, spatialReference: { wkid: 102100 } }, spatialRelationship: 'intersects',
      outFields: ['*'], returnGeometry: true, returnCentroid: true
    });
    const inside = result.features
      .map((f) => ({ f, c: f.geometry.centroid ?? f.geometry.extent?.center }))
      .filter(({ c }) => c && c.x > tile.xmin && c.x < tile.xmax && c.y > tile.ymin && c.y < tile.ymax)
      .map(({ f, c }) => ({ attrs: f.attributes, screen: view.toScreen(c), c }))
      .filter(({ screen }) => screen && screen.x > 60 && screen.x < 860 && screen.y > 60 && screen.y < 760)
      .sort((a, b) => (b.attrs.Shape__Area ?? b.attrs['Shape.STArea()'] ?? 0) - (a.attrs.Shape__Area ?? a.attrs['Shape.STArea()'] ?? 0));
    const pick = inside[0];
    if (!pick) return { none: true, candidates: result.features.length, withCentre: result.features.filter((f) => f.geometry.centroid ?? f.geometry.extent).length, tile, view: view.extent.toJSON() };
    const hit = await view.hitTest(pick.screen, { include: [layer] });
    const name = pick.attrs.BldgName ?? pick.attrs.BLDG_NAME ?? pick.attrs.Name ?? JSON.stringify(pick.attrs).slice(0, 80);
    return { name, screen: pick.screen, hitTestBefore: hit.results.length, hasAllFeaturesInView: lv.hasAllFeaturesInView, updating: lv.updating, inTile: inside.length };
  }, failedTile);
  console.log(JSON.stringify({ label: LABEL, failedTile: !!failedTile, ...target }));
  if (target.none && failedTile) { await b.close(); process.exit(2); }

  // With no tile failed (the control), there is no building to click: only the bare-ground click below runs.
  const popup = p.locator('tamu-gisc-feature-popup .popup');
  let openedAfter = null, text = null, clickQueries = null;
  if (!target.none) {
    const before = buildingQueries.length;
    await p.mouse.click(target.screen.x, target.screen.y);
    await p.waitForTimeout(4000);
    openedAfter = await popup.evaluate((el) => !el.classList.contains('hidden')).catch(() => false);
    text = openedAfter ? (await popup.innerText()).replace(/\s+/g, ' ').slice(0, 120) : null;
    clickQueries = buildingQueries.length - before;
    if (SHOT) await p.screenshot({ path: SHOT });
  }
  if (SHOT && target.none) await p.screenshot({ path: SHOT });
  const hasAll = await p.evaluate(() => {
    const view = document.querySelector('arcgis-map').view;
    return view.allLayerViews.find((v) => v.layer.id === 'buildings-layer')?.hasAllFeaturesInView;
  });
  console.log(JSON.stringify({ label: LABEL, buildingsHasAllFeaturesInView: hasAll, realTileErrorsByLayer: tileErrors }));

  // A second click, on another building in the same tile, and one on a fully drawn tile's bare ground: what each costs.
  let secondClick = null;
  if (process.env.COST) {
    await p.keyboard.press('Escape');
    // Bare ground in the open map: a screen point where no building is (asked of the service) and the hit test is empty.
    const bare = await p.evaluate(async () => {
      const view = document.querySelector('arcgis-map').view;
      const layer = view.map.allLayers.find((l) => l.id === 'buildings-layer');
      for (let y = 120; y < 740; y += 40) for (let x = 100; x < 840; x += 40) {
        const point = view.toMap({ x, y });
        const hits = await view.hitTest({ x, y });
        const n = await layer.queryFeatureCount({ geometry: point, spatialRelationship: 'intersects' });
        if (n === 0 && hits.results.filter((r) => r.graphic?.layer?.popupComponent).length === 0) return { x, y };
      }
      return null;
    });
    // The finder's own counts go to the service too; only what the click sends is counted.
    await p.waitForTimeout(1000);
    const n0 = buildingQueries.length;
    if (bare) await p.mouse.click(bare.x, bare.y);
    await p.waitForTimeout(3000);
    const bareOpened = await popup.evaluate((el) => !el.classList.contains('hidden')).catch(() => false);
    secondClick = { bareGround: bare, buildingQueries: buildingQueries.length - n0, popupOpened: bareOpened };
  }
  console.log(JSON.stringify({ label: LABEL, popupOpened: openedAfter, popupText: text, buildingQueriesForTheClick: clickQueries, secondClick }));
  await b.close();
})();
