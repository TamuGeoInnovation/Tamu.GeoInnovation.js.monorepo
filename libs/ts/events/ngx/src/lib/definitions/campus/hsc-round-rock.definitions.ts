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

export const HscRoundRockLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: HSC_ROUND_ROCK_LAYERS.BASEMAP,
    title: 'HSC Round Rock Basemap',
    url: Connections.hscRoundRockBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  },
  {
    type: 'feature',
    id: HSC_ROUND_ROCK_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.hscRoundRockFeatureServerUrl}/6`,
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

/**
 * Property search source for the HSC Round Rock campus, backed by the `FeatureServer` companion to the
 * vector-tile basemap (layer `6`, "Structure").
 *
 * The layer index is not shared with the other satellite campuses: Mays's building layer is `0`,
 * Kingsville's and Corpus Christi's are `2`. Its 21 fields carry the same names the search and popup read
 * (`bldgname`, `bldgabbr`, `number`, `address`, `city`, `zip`), checked against the service.
 */
export const HscRoundRockSearchSources: SearchSource[] = [
  {
    source: 'hsc-round-rock-property',
    // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.hscRoundRockFeatureServerUrl}/6`,
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

export const HscRoundRockConfiguration: EventConfiguration = {
  id: 'hsc-round-rock',
  name: 'HSC Round Rock',
  applicationName: 'Aggie Map - HSC Round Rock',
  shortApplicationName: 'HSC Round Rock',
  introductionText: 'Map of the Texas A&M University Health Science Center Round Rock campus.',
  eventDates: [],
  mapCenter: [-97.647639, 30.55765],
  zoom: 17,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  buildingPopup: {
    layerId: HSC_ROUND_ROCK_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
  },
  searchSources: HscRoundRockSearchSources
};

export const HscRoundRockOptions: SpecialEventOptions = [];

export const HscRoundRockTs: AggiemapCustomMapConfiguration = {
  configuration: HscRoundRockConfiguration,
  options: HscRoundRockOptions,
  sources: HscRoundRockLayerSources,
  references: HSC_ROUND_ROCK_LAYERS,
  type: 'general-map',
  discover: {
    id: HscRoundRockConfiguration.id,
    name: HscRoundRockConfiguration.name,
    description: 'Map of the Texas A&M University Health Science Center Round Rock campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    // Listed on production as well as development (#2473): every satellite campus is live. The general
    // map search still excludes them all on both environments (#1482), which is deliberate.
    thumbnail: './assets/images/campus/hsc-round-rock.jpg'
  }
};
