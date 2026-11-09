import { LayerSource } from '@tamu-gisc/common/types';

import { factory } from '../utils/definitionFactory';

/**
 * Layers whose source publishes no usable symbology keep a renderer of their own (#1576).
 *
 * #1526 deleted the renderers this repository had copied from services, so each layer draws the way its
 * service publishes it. That is right only where a service publishes something worth drawing. Dining
 * and AggiePrint lost their icons on production for 2 days, drawn as ArcGIS's default markers.
 */
describe('main map layer symbology', () => {
  const sources = factory({ environment: 'prod' }).LayerSources as LayerSource[];
  const renderer = (s: LayerSource) => (s.native as { renderer?: { uniqueValueInfos?: unknown[] } })?.renderer;

  it.each(sources.filter((s) => s.type === 'geojson').map((s) => [s.id, s]))(
    'gives the GeoJSON layer %s a renderer, since GeoJSON carries no symbology',
    (_id, source) => {
      expect(renderer(source as LayerSource)).toBeDefined();
    }
  );

  it('draws AggiePrint printers with icons, since the service publishes only the default RedSphere', () => {
    const aggieprint = sources.find((s) => s.id === 'aggieprint-locations-layer' || /aggieprint/i.test(String(s.id)));

    expect(aggieprint).toBeDefined();
    expect(renderer(aggieprint as LayerSource)?.uniqueValueInfos?.length).toBe(2);
  });

  // The buildings are a click target over the basemap's own, and their service publishes an opaque teal fill (#2707).
  // #1526 removed this layer's near-invisible fill once already, because nothing said why it was there.
  it('draws the Buildings layer from the buildings service, nearly invisible but still drawn, with numbered rows only', () => {
    const buildings = sources.find((s) => s.id === 'buildings-layer') as LayerSource & { url: string };
    const native = buildings.native as {
      definitionExpression?: string;
      renderer?: { symbol?: { color?: number[]; outline?: { style?: string } } };
    };

    expect(buildings.url).toBe('https://gis.tamu.edu/arcgis/rest/services/Hosted/VTBase3/FeatureServer/0');
    expect(native.definitionExpression).toBe('number IS NOT NULL');
    expect(native.renderer?.symbol?.color?.[3]).toBeGreaterThan(0);
    expect(native.renderer?.symbol?.color?.[3]).toBeLessThanOrEqual(0.01);
    expect(native.renderer?.symbol?.outline?.style).toBe('none');
  });
});
