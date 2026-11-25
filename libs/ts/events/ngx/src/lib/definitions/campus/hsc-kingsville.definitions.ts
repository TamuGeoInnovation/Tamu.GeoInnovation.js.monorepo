import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the HSC Kingsville satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HSC_KINGSVILLE_LAYERS {
  BASEMAP = 'hsc-kingsville-basemap-layer',
  PROPERTY = 'hsc-kingsville-property-layer'
}

export const HscKingsvilleTs = satelliteCampus({
  id: 'hsc-kingsville',
  name: 'HSC Kingsville',
  introductionText: 'Map of the Texas A&M University Health Science Center Kingsville campus.',
  center: [-97.882376, 27.527322],
  zoom: 17,
  layers: HSC_KINGSVILLE_LAYERS,
  basemap: { id: HSC_KINGSVILLE_LAYERS.BASEMAP, url: Connections.hscKingsvilleBasemapUrl },
  /**
   * Property search source for the HSC Kingsville campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (layer `2`, "Structure").
   *
   * The layer index is not shared with the other satellite campuses: Mays's building layer is `0`,
   * Round Rock's is `6`. Its 21 fields carry the same names the search and popup read (`bldgname`,
   * `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
   */
  buildings: {
    id: HSC_KINGSVILLE_LAYERS.PROPERTY,
    url: `${Connections.hscKingsvilleFeatureServerUrl}/2`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX'
  }
});

export const HscKingsvilleLayerSources: LayerSource[] = HscKingsvilleTs.sources;
