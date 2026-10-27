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

export const HscKingsvilleLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: HSC_KINGSVILLE_LAYERS.BASEMAP,
    title: 'HSC Kingsville Basemap',
    url: Connections.hscKingsvilleBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  },
  {
    type: 'feature',
    id: HSC_KINGSVILLE_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.hscKingsvilleFeatureServerUrl}/2`,
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

/**
 * Property search source for the HSC Kingsville campus, backed by the `FeatureServer` companion to the
 * vector-tile basemap (layer `2`, "Structure").
 *
 * The layer index is not shared with the other satellite campuses: Mays's building layer is `0`,
 * Round Rock's is `6`. Its 21 fields carry the same names the search and popup read (`bldgname`,
 * `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
 */
export const HscKingsvilleSearchSources: SearchSource[] = [
  {
    source: 'hsc-kingsville-property',
    // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.hscKingsvilleFeatureServerUrl}/2`,
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

export const HscKingsvilleConfiguration: EventConfiguration = {
  id: 'hsc-kingsville',
  name: 'HSC Kingsville',
  applicationName: 'Aggie Map — HSC Kingsville',
  shortApplicationName: 'HSC Kingsville',
  introductionText: 'Map of the Texas A&M University Health Science Center Kingsville campus.',
  eventDates: [],
  mapCenter: [-97.882376, 27.527322],
  zoom: 17,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  buildingPopup: {
    layerId: HSC_KINGSVILLE_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
  },
  searchSources: HscKingsvilleSearchSources
};

export const HscKingsvilleOptions: SpecialEventOptions = [];

export const HscKingsvilleTs: AggiemapCustomMapConfiguration = {
  configuration: HscKingsvilleConfiguration,
  options: HscKingsvilleOptions,
  sources: HscKingsvilleLayerSources,
  references: HSC_KINGSVILLE_LAYERS,
  type: 'general-map',
  discover: {
    id: HscKingsvilleConfiguration.id,
    name: HscKingsvilleConfiguration.name,
    description: 'Map of the Texas A&M University Health Science Center Kingsville campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    // Listed on production as well as development (#2473): every satellite campus is live. The general
    // map search still excludes them all on both environments (#1482), which is deliberate.
    thumbnail: './assets/images/campus/hsc-kingsville.jpg'
  }
};
