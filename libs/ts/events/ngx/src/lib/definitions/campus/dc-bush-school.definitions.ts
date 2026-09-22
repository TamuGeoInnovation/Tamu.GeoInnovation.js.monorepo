import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../../interfaces/special-event.interface';

/**
 * Layer ids used by the DC/Bush School satellite-campus map. Unlike the main map, this map only
 * ever shows a single vector-tile basemap, so there's only one layer source.
 */
export enum DC_BUSH_SCHOOL_LAYERS {
  BASEMAP = 'dc-bush-school-basemap-layer'
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
  }
];

/**
 * Property search source for the DC / Bush School campus, backed by the `FeatureServer` companion
 * to the vector-tile basemap (same base path, layer `0`, "On-Campus"). This service only exposes a
 * `propertyname` field, unlike Galveston/McAllen which also have abbreviation/number fields.
 */
export const DCBushSchoolSearchSources: SearchSource[] = [
  {
    source: 'dc-bush-school-property',
    name: 'Property',
    url: `${Connections.dcBushSchoolFeatureServerUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['propertyname'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      },
      scoringWhere: {
        keys: ['propertyname'],
        operators: ['LIKE'],
        wildcards: ['startsWith'],
        transformations: ['UPPER']
      }
    },
    scoringKeys: ['attributes.propertyname'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.propertyname}',
    popupComponent: Popups.BasePopupComponent,
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
  // Center/zoom derived from the campus property layer's full extent (DC_Bush_School FeatureServer).
  mapCenter: [-77.037605, 38.903422],
  zoom: 19,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
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
    mapType: 'satellite-campus'
  }
};
