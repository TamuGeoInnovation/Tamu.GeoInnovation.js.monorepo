import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the Fort Worth Law School satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum FORT_WORTH_LAW_LAYERS {
  // The map adds these in reverse, so the first draws on top: the construction over the tiles (#2532).
  CONSTRUCTION = 'fort-worth-law-construction-layer',
  BASEMAP = 'fort-worth-law-basemap-layer',
  PROPERTY = 'fort-worth-law-property-layer'
}

export const FortWorthLawTs = satelliteCampus({
  id: 'fort-worth-law',
  name: 'Fort Worth Law School',
  introductionText: 'Map of the Texas A&M University School of Law campus in Fort Worth.',
  // Centred on the three TAMU buildings - the Law School (LAWS), the Law & Education building (FWLE)
  // and Research & Innovation A (RIB-A) - which sit together around 3800-3901 on the east side.
  // Deliberately NOT the layer's published extent centre, which is about a kilometre north-west of
  // them: the layer's fourth feature is "Tarrant County" (DS04) at -97.3353, 32.7551, and it stretches
  // the extent across 1310 m. A map opened on that centre shows downtown Fort Worth with the campus at
  // the edge of the frame.
  center: [-97.324918, 32.748586],
  zoom: 17,
  layers: FORT_WORTH_LAW_LAYERS,
  basemap: { id: FORT_WORTH_LAW_LAYERS.BASEMAP, url: Connections.fortWorthLawBasemapUrl },
  /**
   * Property search source for the Fort Worth Law School campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (layer `0`, "Law School Buildings").
   *
   * The layer carries the same building fields as the other satellite campuses - `bldgname`, `bldgabbr`,
   * `number`, `address`, `city`, `zip` - so the search and popup are declared the same way they are there.
   */
  buildings: {
    id: FORT_WORTH_LAW_LAYERS.PROPERTY,
    url: `${Connections.fortWorthLawFeatureServerUrl}/0`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX'
  },
  construction: {
    id: FORT_WORTH_LAW_LAYERS.CONSTRUCTION,
    url: `${Connections.fortWorthLawFeatureServerUrl}/1`,
    hiddenStyleLayers: ['Construction/1', 'Construction/0']
  }
});

export const FortWorthLawLayerSources: LayerSource[] = FortWorthLawTs.sources;
