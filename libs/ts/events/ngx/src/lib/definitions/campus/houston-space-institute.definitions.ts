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
    essential: true,
    // The published style fills the buildings under construction with a sprite pattern the vector tile packager
    // rasterized onto an opaque tile: a pink grid on solid white (#2506, as College Station's was in #2459). It is
    // repainted here, inside the basemap's own style, as orange at 25%, so it draws under the basemap's outline,
    // labels and buildings. A paint call, not a sprite: `setSpriteSource` blanked the map. Option A of #2506 was to
    // hide it instead, `hiddenStyleLayers: ['GIS.FCOR.HSI_Construction/1']`, which leaves an empty outline on the map.
    styleLayerPaint: { 'GIS.FCOR.HSI_Construction/1': { 'fill-color': 'rgba(230, 152, 0, 0.25)' } },
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
  applicationName: 'Aggie Map - Houston Space Institute',
  shortApplicationName: 'Houston Space Institute',
  introductionText: 'Map of the Texas A&M University Houston Space Institute campus.',
  eventDates: [],
  // Centred on the campus's one building, Texas A&M University Space Institute (B500), from its own
  // `longitude`/`latitude` fields. Layer `4` holds exactly that one feature, so the extent centre and
  // the building agree here - unlike Fort Worth Law School, where they do not.
  mapCenter: [-95.100068, 29.556426],
  // 17 rather than 18: the building is 244 m across, so at 18 it fills the view and the map opens on
  // a featureless rectangle. At 17 the whole campus parcel is in frame, with its parking and Cow
  // Bayou - looked at, not calculated.
  zoom: 17,
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
    // Listed on production as well as development (#2473): every satellite campus is live. The general
    // map search still excludes them all on both environments (#1482), which is deliberate.
    thumbnail: './assets/images/campus/houston-space-institute.jpg'
  }
};
