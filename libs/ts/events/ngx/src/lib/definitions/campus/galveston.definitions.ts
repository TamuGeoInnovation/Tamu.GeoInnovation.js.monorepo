import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../../interfaces/special-event.interface';

/**
 * Layer ids used by the Galveston satellite-campus map. Unlike the main map, this map only ever
 * shows a single vector-tile basemap, so there's only one layer source.
 */
export enum GALVESTON_LAYERS {
  BASEMAP = 'galveston-basemap-layer'
}

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

export const GalvestonLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: GALVESTON_LAYERS.BASEMAP,
    title: 'Galveston Basemap',
    url: Connections.galvestonBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  }
];

/**
 * Building search source for the Galveston campus, backed by the `FeatureServer` companion to the
 * vector-tile basemap (same base path, layer `0`, "University Structures").
 */
export const GalvestonSearchSources: SearchSource[] = [
  {
    source: 'galveston-building',
    name: 'Building',
    url: `${Connections.galvestonFeatureServerUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['bldgname', 'bldgabbrev', 'number'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['bldgname', 'bldgabbrev'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['startsWith', 'startsWith'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    scoringKeys: ['attributes.bldgabbrev', 'attributes.number', 'attributes.bldgname'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.bldgname} ({attributes.number})',
    popupComponent: Popups.BasePopupComponent,
    searchActive: true
  }
];

export const GalvestonConfiguration: EventConfiguration = {
  id: 'galveston',
  name: 'Galveston',
  applicationName: 'Aggie Map — Galveston',
  shortApplicationName: 'Galveston',
  introductionText: 'Map of the Texas A&M University at Galveston campus.',
  eventDates: [],
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  // TODO: set `brandingIconUrl` to an official Texas A&M University at Galveston logo once one is
  // sourced. Until then, the sidebar falls back to the default TAMU branding block.
  searchSources: GalvestonSearchSources
};

export const GalvestonOptions: SpecialEventOptions = [];

export const GalvestonTs: AggiemapCustomMapConfiguration = {
  configuration: GalvestonConfiguration,
  options: GalvestonOptions,
  sources: GalvestonLayerSources,
  references: GALVESTON_LAYERS,
  type: 'general-map',
  discover: {
    id: GalvestonConfiguration.id,
    name: GalvestonConfiguration.name,
    description: 'Map of the Texas A&M University at Galveston campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus'
  }
};
