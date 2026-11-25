import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the Houston Space Institute satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HOUSTON_SPACE_INSTITUTE_LAYERS {
  // The map adds these in reverse, so the first draws on top: the construction over the tiles (#2532).
  CONSTRUCTION = 'houston-space-institute-construction-layer',
  BASEMAP = 'houston-space-institute-basemap-layer',
  PROPERTY = 'houston-space-institute-property-layer'
}

export const HoustonSpaceInstituteTs = satelliteCampus({
  id: 'houston-space-institute',
  name: 'Houston Space Institute',
  introductionText: 'Map of the Texas A&M University Houston Space Institute campus.',
  // Centred on the campus's one building, Texas A&M University Space Institute (B500), from its own
  // `longitude`/`latitude` fields. Layer `4` holds exactly that one feature, so the extent centre and
  // the building agree here - unlike Fort Worth Law School, where they do not.
  center: [-95.100068, 29.556426],
  // 17 rather than 18: the building is 244 m across, so at 18 it fills the view and the map opens on
  // a featureless rectangle. At 17 the whole campus parcel is in frame, with its parking and Cow
  // Bayou - looked at, not calculated.
  zoom: 17,
  layers: HOUSTON_SPACE_INSTITUTE_LAYERS,
  basemap: { id: HOUSTON_SPACE_INSTITUTE_LAYERS.BASEMAP, url: Connections.houstonSpaceInstituteBasemapUrl },
  /**
   * Property search source for the Houston Space Institute campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (layer `4`, "GIS.FCOR.HSI_Structure").
   *
   * The companion publishes six base-data layers rather than one property layer, and none of them is named
   * "Buildings". `/4` is the one to use: its 18 fields are identical to Fort Worth Law School's building
   * layer - `bldgname`, `bldgabbr`, `number`, `address`, `city`, `zip` and the rest - which is what settles
   * it rather than the name. The other five are streets, walls, sidewalk, parking lots and construction;
   * the vector tile basemap already draws them, so the map does not request them.
   */
  buildings: {
    id: HOUSTON_SPACE_INSTITUTE_LAYERS.PROPERTY,
    url: `${Connections.houstonSpaceInstituteFeatureServerUrl}/4`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX'
  },
  construction: {
    id: HOUSTON_SPACE_INSTITUTE_LAYERS.CONSTRUCTION,
    url: `${Connections.houstonSpaceInstituteFeatureServerUrl}/5`,
    hiddenStyleLayers: ['GIS.FCOR.HSI_Construction/1', 'GIS.FCOR.HSI_Construction/0']
  }
});

export const HoustonSpaceInstituteLayerSources: LayerSource[] = HoustonSpaceInstituteTs.sources;
