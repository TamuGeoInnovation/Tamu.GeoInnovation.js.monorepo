import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { SearchSource, containsSearch } from '@tamu-gisc/ui-kits/ngx/search';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../../interfaces/special-event.interface';
import { campusClickOverlayNative } from './campus-overlay.definitions';
import { EventPopups } from '../../modules/popups/popups';

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

export const HscCorpusChristiLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: HSC_CORPUS_CHRISTI_LAYERS.BASEMAP,
    title: 'HSC Corpus Christi Basemap',
    url: Connections.hscCorpusChristiBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  },
  {
    type: 'feature',
    id: HSC_CORPUS_CHRISTI_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.hscCorpusChristiFeatureServerUrl}/2`,
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

/**
 * Property search source for the HSC Corpus Christi campus, backed by the `FeatureServer` companion to the
 * vector-tile basemap (layer `2`, "Structure").
 *
 * The layer index is not shared with the other satellite campuses: Mays's building layer is `0`,
 * Round Rock's is `6`. Its 21 fields carry the same names the search and popup read (`bldgname`,
 * `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
 */
export const HscCorpusChristiSearchSources: SearchSource[] = [
  {
    source: 'hsc-corpus-christi-property',
    // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.hscCorpusChristiFeatureServerUrl}/2`,
    queryParams: {
      ...containsSearch(['bldgname', 'bldgabbr', 'number']),
      scoringWhere: {
        keys: ['bldgname', 'bldgabbr'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['startsWith', 'startsWith'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    scoringKeys: ['attributes.bldgabbr', 'attributes.number', 'attributes.bldgname'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.bldgname} ({attributes.number})',
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    searchActive: true
  }
];

export const HscCorpusChristiConfiguration: EventConfiguration = {
  id: 'hsc-corpus-christi',
  name: 'HSC Corpus Christi',
  applicationName: 'Aggie Map - HSC Corpus Christi',
  shortApplicationName: 'HSC Corpus Christi',
  introductionText: 'Map of the Texas A&M University Health Science Center Corpus Christi campus.',
  eventDates: [],
  // Centred on the campus's building, from its own `longitude`/`latitude` fields. The centre in the GIS team's
  // announcement, [-97.361806, 27.709119], is 2.3 km south-east of it and opens on Sunrise Mall (#2464).
  mapCenter: [-97.37815, 27.723583],
  //
  // 18 rather than 17 (#2488): at 17 the one building is a small shape in a wide view of the
  // surrounding streets, which is not what someone opening a campus map is looking for.
  zoom: 18,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  buildingPopup: {
    layerId: HSC_CORPUS_CHRISTI_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
  },
  searchSources: HscCorpusChristiSearchSources
};

export const HscCorpusChristiOptions: SpecialEventOptions = [];

export const HscCorpusChristiTs: AggiemapCustomMapConfiguration = {
  configuration: HscCorpusChristiConfiguration,
  options: HscCorpusChristiOptions,
  sources: HscCorpusChristiLayerSources,
  references: HSC_CORPUS_CHRISTI_LAYERS,
  type: 'general-map',
  discover: {
    id: HscCorpusChristiConfiguration.id,
    name: HscCorpusChristiConfiguration.name,
    description: 'Map of the Texas A&M University Health Science Center Corpus Christi campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    // Listed on production as well as development (#2473): every satellite campus is live. The general
    // map search still excludes them all on both environments (#1482), which is deliberate.
    thumbnail: './assets/images/campus/hsc-corpus-christi.jpg'
  }
};
