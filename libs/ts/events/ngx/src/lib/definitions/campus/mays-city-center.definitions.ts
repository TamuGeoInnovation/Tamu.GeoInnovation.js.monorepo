import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the Mays City Center satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum MAYS_CITY_CENTER_LAYERS {
  BASEMAP = 'mays-city-center-basemap-layer',
  PROPERTY = 'mays-city-center-property-layer'
}

export const MaysCityCenterTs = satelliteCampus({
  id: 'mays-city-center',
  name: 'Mays City Center',
  introductionText: 'Map of the Texas A&M University Mays City Center campus.',
  center: [-95.562044, 29.780445],
  zoom: 17,
  layers: MAYS_CITY_CENTER_LAYERS,
  basemap: { id: MAYS_CITY_CENTER_LAYERS.BASEMAP, url: Connections.maysCityCenterBasemapUrl },
  /**
   * Property search source for the Mays City Center campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (layer `0`, "Buildings").
   *
   * The layer index is not shared with the other satellite campuses: Round Rock's building layer is `6`,
   * Kingsville's and Corpus Christi's are `2`. Its 21 fields carry the same names the search and popup read
   * (`bldgname`, `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
   */
  buildings: {
    id: MAYS_CITY_CENTER_LAYERS.PROPERTY,
    url: `${Connections.maysCityCenterFeatureServerUrl}/0`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX'
  }
});

export const MaysCityCenterLayerSources: LayerSource[] = MaysCityCenterTs.sources;
