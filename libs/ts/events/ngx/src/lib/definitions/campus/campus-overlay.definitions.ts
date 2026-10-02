import { FeatureLayerSourceProperties } from '@tamu-gisc/common/types';
import { commonLayerProps } from '@tamu-gisc/aggiemap/ngx/common';

/**
 * Display settings for a satellite campus map's click overlay, shared by every campus.
 *
 * A campus map draws its buildings from a vector tile basemap, which `view.hitTest()` cannot query, so
 * each campus adds its `FeatureServer` as a near-invisible `FeatureLayer` purely so a click on a
 * building opens its popup. The overlay is for clicking, not for seeing:
 *
 * - a fill at 1% opacity, so it can be hit but not seen, and no outline;
 * - no legend entry;
 * - **no labels.** The basemap already labels the buildings, and the service's own labelling is not
 *   ours to show. The DC service labels with `[Number] CONCAT NEWLINE CONCAT [Abbrev]`, an ArcMap-era
 *   expression this API does not evaluate, so it drew that text literally over the building (#1283).
 *
 * The three campuses each had an identical copy of this before; one definition means a campus added
 * later gets all of it, and a fix reaches every campus at once.
 */
export const campusClickOverlayNative: FeatureLayerSourceProperties['native'] = {
  ...commonLayerProps,
  legendEnabled: false,
  labelsVisible: false,
  renderer: {
    type: 'simple',
    symbol: {
      type: 'simple-fill',
      style: 'solid',
      color: [0, 0, 0, 0.01],
      outline: {
        width: '0'
      }
    }
  }
};
