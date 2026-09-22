import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../../interfaces/special-event.interface';

/**
 * Layer ids used by the McAllen satellite-campus map. Unlike the main map, this map only ever
 * shows a single vector-tile basemap, so there's only one layer source.
 */
export enum MCALLEN_LAYERS {
  BASEMAP = 'mcallen-basemap-layer'
}

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

export const McAllenLayerSources: LayerSource[] = [
  {
    type: 'vector-tile',
    id: MCALLEN_LAYERS.BASEMAP,
    title: 'McAllen Basemap',
    url: Connections.mcallenBasemapUrl,
    listMode: 'hide',
    visible: true,
    essential: true
  }
];

/**
 * Building search source for the McAllen Higher Ed campus, backed by the `FeatureServer` companion
 * to the vector-tile basemap (same base path, layer `2`, "McAllen Higher Ed Structures").
 */
export const McAllenSearchSources: SearchSource[] = [
  {
    source: 'mcallen-building',
    name: 'Building',
    url: `${Connections.mcallenFeatureServerUrl}/2`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['name', 'abbrev', 'number'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['name', 'abbrev'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['startsWith', 'startsWith'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    scoringKeys: ['attributes.abbrev', 'attributes.number', 'attributes.name'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.name} ({attributes.number})',
    popupComponent: Popups.BasePopupComponent,
    searchActive: true
  }
];

export const McAllenConfiguration: EventConfiguration = {
  id: 'mcallen',
  name: 'McAllen',
  applicationName: 'Aggie Map — McAllen',
  shortApplicationName: 'McAllen',
  introductionText: 'Map of the Texas A&M Higher Education Center at McAllen campus.',
  eventDates: [],
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  searchSources: McAllenSearchSources
};

export const McAllenOptions: SpecialEventOptions = [];

export const McAllenTs: AggiemapCustomMapConfiguration = {
  configuration: McAllenConfiguration,
  options: McAllenOptions,
  sources: McAllenLayerSources,
  references: MCALLEN_LAYERS,
  type: 'general-map',
  discover: {
    id: McAllenConfiguration.id,
    name: McAllenConfiguration.name,
    description: 'Map of the Texas A&M Higher Education Center at McAllen campus.',
    source: 'internal',
    type: 'satellite-campus',
    mapType: 'satellite-campus'
  }
};
