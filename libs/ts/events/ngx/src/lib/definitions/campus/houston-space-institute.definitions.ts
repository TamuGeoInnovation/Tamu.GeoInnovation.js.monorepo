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
 * Layer ids used by the Houston Space Institute satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on a building would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum HOUSTON_SPACE_INSTITUTE_LAYERS {
  BASEMAP = 'houston-space-institute-basemap-layer',
  PROPERTY = 'houston-space-institute-property-layer'
}

export const HoustonSpaceInstituteLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: HOUSTON_SPACE_INSTITUTE_LAYERS.BASEMAP,
    title: 'Houston Space Institute Basemap',
    url: Connections.houstonSpaceInstituteBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  },
  {
    type: 'feature',
    id: HOUSTON_SPACE_INSTITUTE_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.houstonSpaceInstituteFeatureServerUrl}/4`,
    popupComponent: EventPopups.CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

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
export const HoustonSpaceInstituteSearchSources: SearchSource[] = [
  {
    source: 'houston-space-institute-property',
    // `?bldg=1234`, and `?abbrv=XYZ` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.houstonSpaceInstituteFeatureServerUrl}/4`,
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

export const HoustonSpaceInstituteConfiguration: EventConfiguration = {
  id: 'houston-space-institute',
  name: 'Houston Space Institute',
  applicationName: 'Aggie Map — Houston Space Institute',
  shortApplicationName: 'Houston Space Institute',
  introductionText: 'Map of the Texas A&M University Houston Space Institute campus.',
  eventDates: [],
  // Centre and zoom derived from layer `4`'s published extent: 263 m by 244 m.
  mapCenter: [-95.100091, 29.556442],
  zoom: 18,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  buildingPopup: {
    layerId: HOUSTON_SPACE_INSTITUTE_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'TX' }
  },
  searchSources: HoustonSpaceInstituteSearchSources
};

export const HoustonSpaceInstituteOptions: SpecialEventOptions = [];

export const HoustonSpaceInstituteTs: AggiemapCustomMapConfiguration = {
  configuration: HoustonSpaceInstituteConfiguration,
  options: HoustonSpaceInstituteOptions,
  sources: HoustonSpaceInstituteLayerSources,
  references: HOUSTON_SPACE_INSTITUTE_LAYERS,
  type: 'general-map',
  discover: {
    id: HoustonSpaceInstituteConfiguration.id,
    name: HoustonSpaceInstituteConfiguration.name,
    description: 'Map of the Texas A&M University Houston Space Institute campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    thumbnail: './assets/images/campus/houston-space-institute.jpg'
  }
};
