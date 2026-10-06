import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../../interfaces/special-event.interface';
import { campusClickOverlayNative } from './campus-overlay.definitions';
import { CampusBuildingPopupComponent } from '../../modules/popups/campus-building-popup/campus-building-popup.component';

/**
 * Layer ids used by the DC/Bush School satellite-campus map. `BASEMAP` is the visual vector-tile
 * basemap. `PROPERTY` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the
 * companion `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without
 * this overlay clicking on the property would not show a popup (search-selected results still work
 * since those bypass `hitTest()` entirely).
 */
export enum DC_BUSH_SCHOOL_LAYERS {
  BASEMAP = 'dc-bush-school-basemap-layer',
  PROPERTY = 'dc-bush-school-property-layer'
}

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

export const DCBushSchoolLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: DC_BUSH_SCHOOL_LAYERS.BASEMAP,
    title: 'DC / Bush School Basemap',
    url: Connections.dcBushSchoolBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  },
  {
    type: 'feature',
    id: DC_BUSH_SCHOOL_LAYERS.PROPERTY,
    title: 'Property',
    url: `${Connections.dcBushSchoolFeatureServerUrl}/0`,
    popupComponent: CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
  }
];

/**
 * Property search source for the DC / Bush School campus, backed by the `FeatureServer` companion
 * to the vector-tile basemap (same base path, layer `0`, "Bush-DC Buildings"). Since the services
 * were republished as `Hosted/DCBush` (#1110) the layer carries the same building fields as
 * Galveston/McAllen, except that the abbreviation field is `bldgabbr`, not `bldgabbrev`.
 */
export const DCBushSchoolSearchSources: SearchSource[] = [
  {
    source: 'dc-bush-school-property',
    // `?bldg=1234`, and `?abbrv=OCNG` for a building with no number (#1481). The popup's copy link
    // reads these same two names, so one declaration decides what a shared link says and what
    // `EventService.selectFeatureByConfiguredParam` accepts when it is opened. Both forms match
    // against every field in `where.keys` below, so either resolves whichever value it carries.
    urlQueryParam: 'bldg',
    urlQueryParamAliases: ['abbrv'],
    name: 'Property',
    url: `${Connections.dcBushSchoolFeatureServerUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['bldgname', 'bldgabbr', 'number'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
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
    popupComponent: CampusBuildingPopupComponent,
    searchActive: true
  }
];

export const DCBushSchoolConfiguration: EventConfiguration = {
  id: 'dc-bush-school',
  name: 'DC / Bush School',
  applicationName: 'Aggie Map — DC / Bush School',
  shortApplicationName: 'DC / Bush School',
  introductionText: 'Map of the Texas A&M Bush School of Government & Public Service campus in Washington, D.C.',
  eventDates: [],
  // Center/zoom derived from the campus property layer's full extent (DCBush FeatureServer).
  mapCenter: [-77.037605, 38.903422],
  zoom: 19,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  // The DC layer has no `name` field, and its abbreviation field is `bldgabbr`.
  buildingPopup: {
    layerId: DC_BUSH_SCHOOL_LAYERS.PROPERTY,
    title: ['bldgname', 'bldgabbr'],
    number: 'number',
    abbreviation: 'bldgabbr',
    address: { street: 'address', city: 'city', zip: 'zip', state: 'DC' }
  },
  // TODO: set `brandingIconUrl` to an official Bush School of Government & Public Service (D.C.
  // campus) logo once one is sourced. Until then, the sidebar falls back to the default TAMU
  // branding block.
  searchSources: DCBushSchoolSearchSources
};

export const DCBushSchoolOptions: SpecialEventOptions = [];

export const DCBushSchoolTs: AggiemapCustomMapConfiguration = {
  configuration: DCBushSchoolConfiguration,
  options: DCBushSchoolOptions,
  sources: DCBushSchoolLayerSources,
  references: DC_BUSH_SCHOOL_LAYERS,
  type: 'general-map',
  discover: {
    id: DCBushSchoolConfiguration.id,
    name: DCBushSchoolConfiguration.name,
    description: 'Map of the Texas A&M Bush School of Government & Public Service campus in Washington, D.C.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus',
    thumbnail: './assets/images/campus/dc-bush-school.jpg'
  }
};
