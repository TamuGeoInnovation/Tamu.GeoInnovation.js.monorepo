import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { LayerSource } from '@tamu-gisc/common/types';

import { satelliteCampus } from './satellite-campus';

/**
 * Layer ids used by the two HSC Dallas satellite-campus maps. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HSC_COLLEGE_OF_DENTISTRY_LAYERS {
  BASEMAP = 'hsc-college-of-dentistry-basemap-layer',
  PROPERTY = 'hsc-college-of-dentistry-property-layer'
}

/**
 * The HSC College of Dentistry, from the published `Hosted/HSCD` service (#2476).
 *
 * That service holds six buildings in two places about 4 km apart, under a basemap whose extent is about
 * 60 km wide. **Only the north-western site is a map for now** - the five buildings round the College of
 * Dentistry - which is what the GIS team asked for on 27 October: the south-eastern one, Dr. M.C. Cooper
 * Dental Clinic, comes later as its own map from this same service.
 *
 * So the map is told apart from the rest of the service by what it shows of the `/4 Structures` layer: it
 * opens on its own site and searches only its own buildings, and the basemap draws the whole published
 * area underneath, which is expected.
 *
 * The split is on `zip` rather than on building numbers: the postcode is what actually distinguishes the
 * two sites, and it stays true when a building is added to either.
 *
 * The maps' display names are not settled between "Medicine" and "Dentistry" (every northwest building
 * is the College of Dentistry; the southeast one is a dental clinic). Each is written once, here, and
 * every other name on the map is built from it.
 *
 * Its building layer, `/4 Structures` (plural, and not the index the other campuses use), has the same fields as
 * Houston Space Institute's; the postcode keeps both the overlay and the search to this site.
 */
export const HscCollegeOfDentistryTs = satelliteCampus({
  id: 'hsc-college-of-dentistry',
  name: 'HSC College of Dentistry',
  introductionText: 'Map of the Texas A&M University HSC College of Dentistry campus.',
  // The middle of the five buildings round the College of Dentistry. They span about 600 m, so at 17 all five are in frame
  // with the map's sidebar open; at 16 they are a cluster of small shapes in the lower right.
  center: [-96.78215, 32.789],
  // 18 rather than 17 (#2488): 17 fits all five buildings but leaves them small in a wide view of
  // downtown Dallas, which reads as the wrong place rather than as the campus.
  zoom: 18,
  layers: HSC_COLLEGE_OF_DENTISTRY_LAYERS,
  basemap: { id: HSC_COLLEGE_OF_DENTISTRY_LAYERS.BASEMAP, url: Connections.hscDallasBasemapUrl },
  buildings: {
    id: HSC_COLLEGE_OF_DENTISTRY_LAYERS.PROPERTY,
    url: `${Connections.hscDallasFeatureServerUrl}/4`,
    kind: 'property',
    fields: { name: 'bldgname', abbreviation: 'bldgabbr', number: 'number' },
    state: 'TX',
    zip: '75246'
  }
});

export const HscCollegeOfDentistryLayerSources: LayerSource[] = HscCollegeOfDentistryTs.sources;
