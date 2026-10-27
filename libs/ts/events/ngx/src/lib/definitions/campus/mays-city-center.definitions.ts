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

export const MaysCityCenterLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: MAYS_CITY_CENTER_LAYERS.BASEMAP,
    title: 'Mays City Center Basemap',
    url: Connections.maysCityCenterBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  },
  {
    type: 'feature',
    id: MAYS_CITY_CENTER_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.maysCityCenterFeatureServerUrl}/0`,
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

/**
 * Property search source for the Mays City Center campus, backed by the `FeatureServer` companion to the
 * vector-tile basemap (layer `0`, "Buildings").
 *
 * The layer index is not shared with the other satellite campuses: Round Rock's building layer is `6`,
 * Kingsville's and Corpus Christi's are `2`. Its 21 fields carry the same names the search and popup read
 * (`bldgname`, `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
 */
export const MaysCityCenterSearchSources: SearchSource[] = [
  {
    source: 'mays-city-center-property',
    // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.maysCityCenterFeatureServerUrl}/0`,
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

export const MaysCityCenterConfiguration: EventConfiguration = {
  id: 'mays-city-center',
  name: 'Mays City Center',
  applicationName: 'Aggie Map - Mays City Center',
  shortApplicationName: 'Mays City Center',
  introductionText: 'Map of the Texas A&M University Mays City Center campus.',
  eventDates: [],
  mapCenter: [-95.562044, 29.780445],
  zoom: 17,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  buildingPopup: {
    layerId: MAYS_CITY_CENTER_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
  },
  searchSources: MaysCityCenterSearchSources
};

export const MaysCityCenterOptions: SpecialEventOptions = [];

export const MaysCityCenterTs: AggiemapCustomMapConfiguration = {
  configuration: MaysCityCenterConfiguration,
  options: MaysCityCenterOptions,
  sources: MaysCityCenterLayerSources,
  references: MAYS_CITY_CENTER_LAYERS,
  type: 'general-map',
  discover: {
    id: MaysCityCenterConfiguration.id,
    name: MaysCityCenterConfiguration.name,
    description: 'Map of the Texas A&M University Mays City Center campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    // Listed on production as well as development (#2473): every satellite campus is live. The general
    // map search still excludes them all on both environments (#1482), which is deliberate.
    thumbnail: './assets/images/campus/mays-city-center.jpg'
  }
};
