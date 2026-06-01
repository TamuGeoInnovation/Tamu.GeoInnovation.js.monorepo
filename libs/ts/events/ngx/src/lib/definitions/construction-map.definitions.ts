import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum CONSTRUCTION_MAP_LAYERS {
  CONSTRUCTION_DRAW = 'construction-map-draw',
  CURRENT_CONSTRUCTION_AREA = 'current-construction-area',
  PLANNED_CONSTRUCTION_AREA = 'planned-construction-area',
  CONSTRUCTION_POPUP = 'construction-map-popup',
  PLANNED_CONSTRUCTION_POPUP = 'planned-construction-map-popup'
}

/**
 * Two ArcGIS services back this map:
 *
 *   eventUrl (TSConstruction/MapServer)
 *     Sublayer 0 (current) and sublayer 1 (planned). Drives the MapImageLayer that
 *     produces the visible cross-hatched fills, and the two visible FeatureLayers
 *     that drive the legend swatches.
 *     Sublayer 1 field schema: Name, Number, StartDate, EndDate, Owner (no Description).
 *
 *   popupEventUrl (FCOR/Construction_2018/MapServer)
 *     Legacy 2018 service used solely as the popup data source for current construction.
 *     Sublayer 0 exposes a Description field, which TSConstruction sublayer 0 does not.
 */
const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/TSConstruction/MapServer';
const popupEventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer';

/**
 * 'cumulative' lets the popup service resolve each entry sequentially, writing each resolved
 * value back into `attributes` so later template strings like `{attributes.projectName}` can
 * reference the aliased values.
 */
const popupDataResolutionStrategy: NonNullable<LayerSource['popupDataResolutionStrategy']> = 'cumulative';

const plannedConstructionPopupData: NonNullable<LayerSource['popupData']> = {
  projectName: { field: 'Name', collapsed: true },
  projectNumber: { field: 'Number', collapsed: true },
  startDate: { field: 'StartDate', collapsed: true },
  endDate: { field: 'EndDate', collapsed: true },
  owner: { field: 'Owner', collapsed: true },

  name: '{attributes.projectName}',
  description:
    `<strong>Project Name:</strong> {attributes.projectName}<br>` +
    `<strong>Project No:</strong> {attributes.projectNumber}<br>` +
    `<strong>Start Date:</strong> {attributes.startDate}<br>` +
    `<strong>End Date:</strong> {attributes.endDate}<br><br>` +
    `<hr>` +
    `<strong>Note:</strong> {attributes.owner}`
};

const constructionPopupData: NonNullable<LayerSource['popupData']> = {
  projectName: { field: 'Name', collapsed: true },
  projectNumber: { field: 'Number', collapsed: true },
  projectDescription: { field: 'Description', collapsed: true },
  startDate: { field: 'StartDate', collapsed: true },
  endDate: { field: 'EndDate', collapsed: true },
  owner: { field: 'Owner', collapsed: true },

  name: '{attributes.projectName}',
  description:
    `<strong>Project Name:</strong> {attributes.projectName}<br>` +
    `<strong>Project No:</strong> {attributes.projectNumber}<br>` +
    `<strong>Project Description:</strong> {attributes.projectDescription}<br><br>` +
    `<strong>Start Date:</strong> {attributes.startDate}<br>` +
    `<strong>End Date:</strong> {attributes.endDate}<br><br>` +
    `<hr>` +
    `<strong>Note:</strong> {attributes.owner}`
};

export const ConstructionMapDefinitions = {
  CONSTRUCTION_DRAW: {
    id: CONSTRUCTION_MAP_LAYERS.CONSTRUCTION_DRAW,
    name: 'Construction Map Draw',
    url: eventUrl
  },
  CURRENT_CONSTRUCTION_AREA: {
    id: CONSTRUCTION_MAP_LAYERS.CURRENT_CONSTRUCTION_AREA,
    name: 'Current Construction Area',
    url: `${eventUrl}/0`
  },
  PLANNED_CONSTRUCTION_AREA: {
    id: CONSTRUCTION_MAP_LAYERS.PLANNED_CONSTRUCTION_AREA,
    name: 'Planned Construction Area',
    url: `${eventUrl}/1`
  },
  CONSTRUCTION_POPUP: {
    id: CONSTRUCTION_MAP_LAYERS.CONSTRUCTION_POPUP,
    name: 'Construction Area',
    url: `${popupEventUrl}/0`
  },
  PLANNED_CONSTRUCTION_POPUP: {
    id: CONSTRUCTION_MAP_LAYERS.PLANNED_CONSTRUCTION_POPUP,
    name: 'Planned Construction Area Popup',
    url: `${eventUrl}/1`
  }
};

/**
 * Layer architecture:
 *
 *   Two FeatureLayers drive the legend (one per area). The MapImageLayer above them
 *   covers their default rendering with server-side cross-hatched fills, but the
 *   FeatureLayers' renderers still populate the legend panel.
 *
 *   Two more invisible FeatureLayers (opacity 0) sit above the MapImageLayer purely
 *   to intercept popup clicks. They are added last so they end up at the top of the
 *   layers collection — ESRI's Map.add() clamps high `layerIndex` values to the
 *   current collection size, so relying on `layerIndex` alone is not enough to
 *   guarantee a layer ends up on top. Order of insertion is what determines the
 *   final z-position.
 *
 *   Current construction uses the legacy 2018 service for its popup layer because
 *   it is the only source that exposes the Description field.
 */
export const ConstructionMapColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_AREA.id,
    title: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_AREA.name,
    url: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_AREA.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ConstructionMapDefinitions.CURRENT_CONSTRUCTION_AREA.id,
    title: ConstructionMapDefinitions.CURRENT_CONSTRUCTION_AREA.name,
    url: ConstructionMapDefinitions.CURRENT_CONSTRUCTION_AREA.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'map-image',
    id: ConstructionMapDefinitions.CONSTRUCTION_DRAW.id,
    title: ConstructionMapDefinitions.CONSTRUCTION_DRAW.name,
    url: ConstructionMapDefinitions.CONSTRUCTION_DRAW.url,
    visible: true,
    listMode: 'hide',
    native: {
      sublayers: [
        {
          id: 1,
          title: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_AREA.name,
          visible: true,
          popupEnabled: false
        },
        {
          id: 0,
          title: ConstructionMapDefinitions.CURRENT_CONSTRUCTION_AREA.name,
          visible: true,
          popupEnabled: false
        }
      ] as unknown as esri.SublayerProperties[]
    }
  },
  {
    type: 'feature',
    id: ConstructionMapDefinitions.CONSTRUCTION_POPUP.id,
    title: ConstructionMapDefinitions.CONSTRUCTION_POPUP.name,
    url: ConstructionMapDefinitions.CONSTRUCTION_POPUP.url,
    popupComponent: MarkdownPopupComponent,
    popupData: constructionPopupData,
    popupDataResolutionStrategy,
    visible: true,
    listMode: 'hide',
    native: {
      opacity: 0,
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_POPUP.id,
    title: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_POPUP.name,
    url: ConstructionMapDefinitions.PLANNED_CONSTRUCTION_POPUP.url,
    popupComponent: MarkdownPopupComponent,
    popupData: plannedConstructionPopupData,
    popupDataResolutionStrategy,
    visible: true,
    listMode: 'hide',
    native: {
      opacity: 0,
      outFields: ['*']
    }
  }
];

export const ConstructionMapConfiguration: EventConfiguration = {
  id: 'construction-map',
  name: 'Construction Map',
  applicationName: 'Construction Map',
  shortApplicationName: 'Construction Map',
  introductionText: 'Current and planned campus construction projects.',
  eventDates: [],
  mapCenter: [-96.33799, 30.60974],
  zoom: 16
};

export const ConstructionMapOptions: SpecialEventOptions = [];

export const ConstructionMapTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: ConstructionMapConfiguration,
  options: ConstructionMapOptions,
  sources: ConstructionMapColdLayerSources,
  references: CONSTRUCTION_MAP_LAYERS,
  discover: {
    id: ConstructionMapConfiguration.id,
    name: ConstructionMapConfiguration.name,
    description: 'Current and planned campus construction projects.',
    source: 'internal',
    type: 'operations',
    mapType: 'operations',
    keywords: ['construction', 'planned', 'current', 'operations', 'projects']
  }
};
