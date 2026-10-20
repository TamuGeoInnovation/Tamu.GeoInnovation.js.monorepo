import { expect, test } from './fixtures';
import { blockAnalytics } from './analytics';

/**
 * Every feature a map's layer holds has a symbol to draw it with (#1981).
 *
 * Business Parking's two lot layers loaded, answered every query and held 73 and 6 lots in their
 * layer views, so every other check passed them, yet the map drew none of them. The service's
 * renderer keys on `GIS.TS.ParkingLots.LotType`, a field the service does not publish, so no lot
 * reached the browser with a value the renderer has a symbol for, and the renderer has no default.
 * A layer can be loaded, queried and full and still draw nothing; this asks the renderer itself.
 *
 * Each map here is opened, and for every feature layer that holds features, a sample of them is
 * given to the layer's own renderer: each must come back with a symbol.
 */

const MAPS = ['/parking/business-parking'];

for (const route of MAPS) {
  test(`${route}: every feature its layers hold has a symbol`, async ({ page }) => {
    test.setTimeout(180_000);

    await blockAnalytics(page);
    await page.goto(`${route}/map/d`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const probe = (window as any).__tamuGiscMapProbe;

      return probe?.ready === true && probe.drawing === false && !!document.querySelector('arcgis-map');
    }, undefined, {
      timeout: 150_000
    });

    const layers = await page.evaluate(async () => {
      const view = (document.querySelector('arcgis-map') as any).view;
      const results: { title: string; held: number; unsymbolized: number }[] = [];

      for (const layer of view.map.allLayers.toArray()) {
        if (layer.type !== 'feature' || !layer.visible || !layer.renderer) continue;

        const layerView = await view.whenLayerView(layer);
        const { features } = await layerView.queryFeatures({ where: '1=1', outFields: ['*'], num: 25 });
        let unsymbolized = 0;

        for (const feature of features) {
          if (!(await layer.renderer.getSymbolAsync(feature))) unsymbolized++;
        }

        results.push({ title: layer.title, held: features.length, unsymbolized });
      }

      return results;
    });

    test.info().annotations.push({ type: 'layers', description: JSON.stringify(layers) });

    for (const layer of layers.filter((l) => l.held > 0)) {
      expect(layer.unsymbolized, `${route}: "${layer.title}" holds features its renderer draws nothing for`).toBe(0);
    }
  });
}
