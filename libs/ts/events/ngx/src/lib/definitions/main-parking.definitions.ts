import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { AggiemapCustomMapConfiguration, EventConfiguration, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum TS_MAIN_PARKING_LAYERS {
  ROUTE_STOP_START_POINTS = 'Route Stop/Start Points',
  CAMPUS_STOPS = 'Campus Stops',
  CONSTRUCTION = 'Construction',
  VISITOR_KIOSKS = 'Visitor Kiosks',
  LINE_PAINT = 'Line Paint',
  PARKING_LOTS = 'Parking Lots',
  RNS_SPACES = 'RNS Spaces'
}

const eventUrl = Connections.tsMainUrl;

export const TsMainParkingDefinitions = {
  ROUTE_STOP_START_POINTS: {
    id: TS_MAIN_PARKING_LAYERS.ROUTE_STOP_START_POINTS,
    layerId: TS_MAIN_PARKING_LAYERS.ROUTE_STOP_START_POINTS,
    name: 'Route Stop/Start Points',
    url: `${eventUrl}/1`
  },
  CAMPUS_STOPS: {
    id: TS_MAIN_PARKING_LAYERS.CAMPUS_STOPS,
    layerId: TS_MAIN_PARKING_LAYERS.CAMPUS_STOPS,
    name: 'Campus Stops',
    url: `${eventUrl}/2`
  },
  CONSTRUCTION: {
    id: TS_MAIN_PARKING_LAYERS.CONSTRUCTION,
    layerId: TS_MAIN_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/3`
  },
  VISITOR_KIOSKS: {
    id: TS_MAIN_PARKING_LAYERS.VISITOR_KIOSKS,
    layerId: TS_MAIN_PARKING_LAYERS.VISITOR_KIOSKS,
    name: 'Visitor Kiosks',
    url: `${eventUrl}/4`
  },
  LINE_PAINT: {
    id: TS_MAIN_PARKING_LAYERS.LINE_PAINT,
    layerId: TS_MAIN_PARKING_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/5`
  },
  PARKING_LOTS: {
    id: TS_MAIN_PARKING_LAYERS.PARKING_LOTS,
    layerId: TS_MAIN_PARKING_LAYERS.PARKING_LOTS,
    name: 'Parking Lots',
    url: `${eventUrl}/6`
  },
  RNS_SPACES: {
    id: TS_MAIN_PARKING_LAYERS.RNS_SPACES,
    layerId: TS_MAIN_PARKING_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/7`
  }
};

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;
const tsMainParkingLotsRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'GIS.TS.ParkingLots.LotType',
  defaultLabel: 'Valid Texas A&M Permit Required',
  defaultSymbol: {
    type: 'simple-fill',
    color: [204, 204, 204, 255],
    outline: {
      type: 'simple-line',
      color: [110, 110, 110, 255],
      width: 1
    }
  } as unknown as esri.SymbolProperties,
  uniqueValueInfos: [
    {
      value: 'Garage Visitor',
      label: 'Visitor Parking',
      symbol: {
        type: 'simple-fill',
        color: [0, 92, 230, 255],
        outline: null
      } as unknown as esri.SymbolProperties
    },
    {
      value: 'Surface Visitor',
      label: 'Visitor Parking',
      symbol: {
        type: 'simple-fill',
        color: [0, 92, 230, 255],
        outline: null
      } as unknown as esri.SymbolProperties
    }
  ]
};

export const TsMainParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TsMainParkingDefinitions.ROUTE_STOP_START_POINTS.id,
    title: TsMainParkingDefinitions.ROUTE_STOP_START_POINTS.name,
    url: TsMainParkingDefinitions.ROUTE_STOP_START_POINTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: TsMainParkingDefinitions.CAMPUS_STOPS.id,
    title: TsMainParkingDefinitions.CAMPUS_STOPS.name,
    url: TsMainParkingDefinitions.CAMPUS_STOPS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },

  {
    type: 'feature',
    id: TsMainParkingDefinitions.CONSTRUCTION.id,
    title: TsMainParkingDefinitions.CONSTRUCTION.name,
    url: TsMainParkingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },

  {
    type: 'feature',
    id: TsMainParkingDefinitions.VISITOR_KIOSKS.id,
    title: TsMainParkingDefinitions.VISITOR_KIOSKS.name,
    url: TsMainParkingDefinitions.VISITOR_KIOSKS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },

  {
    type: 'feature',
    id: TsMainParkingDefinitions.PARKING_LOTS.id,
    title: TsMainParkingDefinitions.PARKING_LOTS.name,
    url: TsMainParkingDefinitions.PARKING_LOTS.url,
    visible: true,
    listMode: 'show',

    popupComponent: MarkdownPopupComponent,
    popupDataResolutionStrategy: 'cumulative',
    popupData: {
      lotName: { field: 'GIS.TS.ParkingLots.Name', collapsed: true },

      total: { field: 'GIS.TS.SpacePnt_Count.Total', collapsed: true },
      loading: { field: 'GIS.TS.SpacePnt_Count.Loading', collapsed: true },
      regular: { field: 'GIS.TS.SpacePnt_Count.Reg', collapsed: true },
      reserved: { field: 'GIS.TS.SpacePnt_Count.RNS', collapsed: true },
      other: { field: 'GIS.TS.SpacePnt_Count.Other', collapsed: true },
      accessible: { field: 'GIS.TS.SpacePnt_Count.DVS', collapsed: true },
      motorcycle: { field: 'GIS.TS.SpacePnt_Count.M_C', collapsed: true },
      timed: { field: 'GIS.TS.SpacePnt_Count.Timed', collapsed: true },
      service: { field: 'GIS.TS.SpacePnt_Count.Serv', collapsed: true },
      ub: { field: 'GIS.TS.SpacePnt_Count.UB', collapsed: true },
      visitor: { field: 'GIS.TS.SpacePnt_Count.Visitor', collapsed: true },
      visitorHc: { field: 'GIS.TS.SpacePnt_Count.Visitor_H_C', collapsed: true },
      rv: { field: 'GIS.TS.SpacePnt_Count.RV', collapsed: true },

      notes: { field: 'GIS.TS.Lot_Data.Lot_Notes', collapsed: true },

      name: '{attributes.lotName}',
      description:
        `Lot Name: {attributes.lotName}\n` +
        `Total Number of Parking: {attributes.total}\n\n` +
        `Number of Loading: {attributes.loading}\n` +
        `Number of Reg (Regular): {attributes.regular}\n` +
        `Number of RNS (Reserved): {attributes.reserved}\n` +
        `Number of Other: {attributes.other}\n` +
        `Number of H/C (Accessible): {attributes.accessible}\n` +
        `Number of M/C (Motorcycle): {attributes.motorcycle}\n` +
        `Number of Timed: {attributes.timed}\n` +
        `Number of Serv (Service): {attributes.service}\n` +
        `Number of UB: {attributes.ub}\n` +
        `Number of Visitor: {attributes.visitor}\n` +
        `Number of Visitor H/C: {attributes.visitorHc}\n` +
        `Number of RV: {attributes.rv}\n\n` +
        `---\n\n` +
        `Lot Notes: {attributes.notes}`
    },

    native: {
      outFields: ['*'],
      renderer: tsMainParkingLotsRenderer,
      popupEnabled: true
    } as unknown as FeatureNative
  },

  {
    type: 'feature',
    id: TsMainParkingDefinitions.LINE_PAINT.id,
    title: TsMainParkingDefinitions.LINE_PAINT.name,
    url: TsMainParkingDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'hide',
    native: {
      outFields: ['*']
    } as unknown as FeatureNative
  },

  {
    type: 'feature',
    id: TsMainParkingDefinitions.RNS_SPACES.id,
    title: TsMainParkingDefinitions.RNS_SPACES.name,
    url: TsMainParkingDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'hide',
    native: {
      outFields: ['*'],
      labelsVisible: true,
      labelingInfo: [
        {
          where: `Anno_Type = 'Serv' AND Rotation < 180`,
          labelExpressionInfo: {
            expression: `
              return 'SERVICE';
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 42.428047,
            color: [255, 255, 255, 255],
            font: {
              family: 'Arial',
              size: 10,
              weight: 'normal'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type = 'Serv' AND Rotation >= 180`,
          labelExpressionInfo: {
            expression: `
              return 'SERVICE';
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 311.18826944,
            color: [255, 255, 255, 255],
            font: {
              size: 10,
              family: 'Arial',
              weight: 'normal'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type = 'M/C' AND Rotation < 180`,
          labelExpressionInfo: {
            expression: `
              return 'Motorcycle';
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 42.35101,
            color: [255, 255, 255, 255],
            font: {
              size: 7,
              family: 'Arial',
              weight: 'normal'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type = 'M/C' AND Rotation >= 180`,
          labelExpressionInfo: {
            expression: `
              return 'Motorcycle';
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 310.998628,
            color: [255, 255, 255, 255],
            font: {
              size: 7,
              family: 'Arial',
              weight: 'normal'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type IS NULL OR Anno_Type NOT IN ('Serv', 'M/C')`,
          labelExpressionInfo: {
            expression: `
              if ($feature.Anno_Type == 'H/C') { return ''; }
              return Trim($feature.RNS_Num);
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            color: [255, 255, 255, 255],
            font: {
              size: 9,
              family: 'Arial',
              weight: 'normal'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        }
      ]
    } as unknown as FeatureNative
  }
];

export const TsMainParkingConfiguration: EventConfiguration = {
  id: 'ts-main-parking',
  name: 'Campus Main Parking',
  applicationName: 'Campus Main Parking',
  shortApplicationName: 'Main Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const TsMainParkingOptions: SpecialEventOptions = [];

export const TsMainParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: TsMainParkingConfiguration,
  options: TsMainParkingOptions,
  sources: TsMainParkingColdLayerSources,
  references: TS_MAIN_PARKING_LAYERS,
  discover: {
    id: TsMainParkingConfiguration.id,
    name: TsMainParkingConfiguration.name,
    description: 'Main parking map with lot information.',
    source: 'internal',
    type: 'parking',
    keywords: ['main', 'parking', 'map', 'lots', 'construction', 'bus', 'kiosk', 'rns', 'line paint']
  }
};
