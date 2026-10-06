import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../../interfaces/special-event.interface';
import { campusClickOverlayNative } from './campus-overlay.definitions';
import { CampusBuildingPopupComponent } from '../../modules/popups/campus-building-popup/campus-building-popup.component';

/**
 * Layer ids used by the McAllen satellite-campus map. `BASEMAP` is the visual vector-tile basemap.
 * `BUILDINGS` is a near-invisible, click-queryable `FeatureLayer` overlay backed by the companion
 * `FeatureServer` -- vector-tile layers aren't queryable via `view.hitTest()`, so without this
 * overlay clicking on a building would not show a popup (search-selected results still work since
 * those bypass `hitTest()` entirely).
 */
export enum MCALLEN_LAYERS {
  BASEMAP = 'mcallen-basemap-layer',
  BUILDINGS = 'mcallen-buildings-layer'
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
  },
  {
    type: 'feature',
    id: MCALLEN_LAYERS.BUILDINGS,
    title: 'Buildings',
    url: `${Connections.mcallenFeatureServerUrl}/2`,
    popupComponent: CampusBuildingPopupComponent,
    listMode: 'hide',
    visible: true,
    essential: true,
    native: campusClickOverlayNative
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
    popupComponent: CampusBuildingPopupComponent,
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
  // Center/zoom derived from the campus building layer's full extent (HigherEd FeatureServer, layer 2).
  mapCenter: [-98.263057, 26.344692],
  zoom: 18,
  hideLayerToggle: true,
  sidebarTabs: ['features'],
  // The McAllen layer has no address fields.
  buildingPopup: {
    layerId: MCALLEN_LAYERS.BUILDINGS,
    title: ['name', 'abbrev'],
    number: 'number'
  },
  // TODO: set `brandingIconUrl` to an official Texas A&M Higher Education Center at McAllen logo
  // once one is sourced. Until then, the sidebar falls back to the default TAMU branding block.
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
    mapType: 'satellite-campus',
    thumbnail: './assets/images/campus/mcallen.jpg'
  }
};
