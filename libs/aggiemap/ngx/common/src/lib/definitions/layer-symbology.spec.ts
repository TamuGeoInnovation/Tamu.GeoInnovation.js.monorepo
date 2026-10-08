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
});
