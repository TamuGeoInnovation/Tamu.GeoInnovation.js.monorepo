import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the HSC Round Rock satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HSC_ROUND_ROCK_LAYERS {
  BASEMAP = 'hsc-round-rock-basemap-layer',
  PROPERTY = 'hsc-round-rock-property-layer'
}

export const HscRoundRockTs = satelliteCampus({
  id: 'hsc-round-rock',
  name: 'HSC Round Rock',
  introductionText: 'Map of the Texas A&M University Health Science Center Round Rock campus.',
  center: [-97.647639, 30.55765],
  zoom: 17,
  layers: HSC_ROUND_ROCK_LAYERS,
  basemap: { id: HSC_ROUND_ROCK_LAYERS.BASEMAP, url: Connections.hscRoundRockBasemapUrl },
  /**
   * Property search source for the HSC Round Rock campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (layer `6`, "Structure").
   *
   * The layer index is not shared with the other satellite campuses: Mays's building layer is `0`,
   * Kingsville's and Corpus Christi's are `2`. Its 21 fields carry the same names the search and popup read
   * (`bldgname`, `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
   */
  buildings: {
    id: HSC_ROUND_ROCK_LAYERS.PROPERTY,
    url: `${Connections.hscRoundRockFeatureServerUrl}/6`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX'
  }
});

export const HscRoundRockLayerSources: LayerSource[] = HscRoundRockTs.sources;
