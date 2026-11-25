import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the HSC Corpus Christi satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HSC_CORPUS_CHRISTI_LAYERS {
  BASEMAP = 'hsc-corpus-christi-basemap-layer',
  PROPERTY = 'hsc-corpus-christi-property-layer'
}

export const HscCorpusChristiTs = satelliteCampus({
  id: 'hsc-corpus-christi',
  name: 'HSC Corpus Christi',
  introductionText: 'Map of the Texas A&M University Health Science Center Corpus Christi campus.',
  // Centred on the campus's building, from its own `longitude`/`latitude` fields. The centre in the GIS team's
  // announcement, [-97.361806, 27.709119], is 2.3 km south-east of it and opens on Sunrise Mall (#2464).
  center: [-97.37815, 27.723583],
  // 18 rather than 17 (#2488): at 17 the one building is a small shape in a wide view of the
  // surrounding streets, which is not what someone opening a campus map is looking for.
  zoom: 18,
  layers: HSC_CORPUS_CHRISTI_LAYERS,
  basemap: { id: HSC_CORPUS_CHRISTI_LAYERS.BASEMAP, url: Connections.hscCorpusChristiBasemapUrl },
  /**
   * Property search source for the HSC Corpus Christi campus, backed by the `FeatureServer` companion to the
   * vector-tile basemap (layer `2`, "Structure").
   *
   * The layer index is not shared with the other satellite campuses: Mays's building layer is `0`,
   * Round Rock's is `6`. Its 21 fields carry the same names the search and popup read (`bldgname`,
   * `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
   */
  buildings: {
    id: HSC_CORPUS_CHRISTI_LAYERS.PROPERTY,
    url: `${Connections.hscCorpusChristiFeatureServerUrl}/2`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX'
  }
});

export const HscCorpusChristiLayerSources: LayerSource[] = HscCorpusChristiTs.sources;
