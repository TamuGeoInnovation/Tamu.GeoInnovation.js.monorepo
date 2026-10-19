import { LayerSource } from '@tamu-gisc/common/types';

import { factory } from '../utils/definitionFactory';
import { MAIN_MAP_LAYERS } from './main.definitions';

/**
 * RNS Spaces keeps its service's own minScale, 1200, rather than the shared 1:100,000 (#1867).
 *
 * From ArcGIS 5.1 a FeatureLayer view holding more than ~30,000 features never stops `updating`. RNS
 * Spaces has about 45,000 points, so at 1:100,000 every map built on these definitions stayed
 * `updating`: the basemap panel's spinner never stopped and the map probe's `drawing` stayed true.
 *
 * Below 1:1200 it still holds all of them, and a link that zooms there - a Football Tailgating `?tent=`
 * or `?zone=` link - left the map `updating` for good. The layer draws nothing (#909), so it is off.
 */
describe('main map layer scales', () => {
  const sources = factory({ environment: 'prod' }).LayerSources as LayerSource[];

  it('loads RNS Spaces only from 1:1200, its service minScale, since ArcGIS 5.1 never finishes it at 1:100,000', () => {
    const rns = sources.find((s) => s.id === MAIN_MAP_LAYERS.RNS_SPACES);

    expect(rns).toBeDefined();
    expect((rns?.native as { minScale?: number })?.minScale).toBe(1200);
  });

  it('leaves RNS Spaces off, since it draws nothing and ArcGIS 5.1 never finishes it below 1:1200 either', () => {
    const rns = sources.find((s) => s.id === MAIN_MAP_LAYERS.RNS_SPACES);

    expect(rns?.visible).toBe(false);
  });
});
