import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { ConstructionPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
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

const ROUTE_STOP_MARKER_SIZE = 22;

const createRouteStopMarkerSvg = (routeNum: string, color: [number, number, number, number]): string => {
  const [r, g, b] = color;
  const fill = `rgb(${r},${g},${b})`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">` +
    `<circle cx="22" cy="22" r="19" fill="${fill}" stroke="white" stroke-width="2"/>` +
    `<text x="22" y="22" text-anchor="middle" ` +
    `fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" dy="0.35em">${routeNum}</text>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const createRouteStopSymbol = (
  routeNum: string,
  color: [number, number, number, number]
): esri.SymbolProperties =>
  ({
    type: 'picture-marker',
    url: createRouteStopMarkerSvg(routeNum, color),
    width: ROUTE_STOP_MARKER_SIZE,
    height: ROUTE_STOP_MARKER_SIZE
  } as unknown as esri.SymbolProperties);

const ROUTE_STOP_COLORS: Array<[string, [number, number, number, number]]> = [
  ['01', [98, 64, 153, 255]],
  ['03', [52, 52, 52, 255]],
  ['04', [82, 189, 160, 255]],
  ['05', [94, 155, 211, 255]],
  ['06', [20, 178, 75, 255]],
  ['07', [220, 20, 60, 255]],
  ['08', [233, 22, 139, 255]],
  ['12', [0, 84, 166, 255]],
  ['15', [40, 144, 58, 255]],
  ['22', [189, 26, 141, 255]],
  ['26', [0, 111, 59, 255]],
  ['27', [0, 174, 239, 255]],
  ['31', [128, 0, 128, 255]],
  ['34', [247, 147, 30, 255]],
  ['35', [96, 56, 19, 255]],
  ['36', [150, 115, 72, 255]],
  ['40', [170, 0, 0, 255]],
  ['41', [85, 255, 0, 255]],
  ['47', [65, 105, 225, 255]],
  ['48', [0, 0, 120, 255]]
];

const tsMainRouteStopPointsRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'Route',
  defaultSymbol: createRouteStopSymbol('?', [128, 128, 128, 255]),
  uniqueValueInfos: ROUTE_STOP_COLORS.map(([value, color]) => ({
    value,
    label: value,
    symbol: createRouteStopSymbol(value, color)
  }))
};

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
      outFields: ['*'],
      renderer: tsMainRouteStopPointsRenderer,
      labelsVisible: false
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: TsMainParkingDefinitions.CAMPUS_STOPS.id,
    title: TsMainParkingDefinitions.CAMPUS_STOPS.name,
    url: TsMainParkingDefinitions.CAMPUS_STOPS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'StopName',
        collapsed: true
      },
      description: 'Route: {attributes.Route}'
    },
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
    popupComponent: ConstructionPopupComponent,
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
    popupComponent: MarkdownWDirectionsPopupComponent,
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

      total: { field: 'GIS.TS.SPC_PNT_CNT.Total', collapsed: true },
      loading: { field: 'GIS.TS.SPC_PNT_CNT.Loading', collapsed: true },
      regular: { field: 'GIS.TS.SPC_PNT_CNT.Reg', collapsed: true },
      reserved: { field: 'GIS.TS.SPC_PNT_CNT.RNS', collapsed: true },
      other: { field: 'GIS.TS.SPC_PNT_CNT.Other', collapsed: true },
      accessible: { field: 'GIS.TS.SPC_PNT_CNT.DVS', collapsed: true },
      motorcycle: { field: 'GIS.TS.SPC_PNT_CNT.M_C', collapsed: true },
      timed: { field: 'GIS.TS.SPC_PNT_CNT.Timed', collapsed: true },
      service: { field: 'GIS.TS.SPC_PNT_CNT.Serv', collapsed: true },
      ub: { field: 'GIS.TS.SPC_PNT_CNT.UB', collapsed: true },
      visitor: { field: 'GIS.TS.SPC_PNT_CNT.Visitor', collapsed: true },
      visitorHc: { field: 'GIS.TS.SPC_PNT_CNT.Visitor_H_C', collapsed: true },
      rv: { field: 'GIS.TS.SPC_PNT_CNT.RV', collapsed: true },

      notes: { field: 'GIS.TS.Lot_Data.Lot_Notes', collapsed: true },

      name: '{attributes.lotName}',
      description:
        `Lot Name: {attributes.lotName}\n` +
        `Total Number of Parking: {attributes.total}\n\n` +
        `Number of Loading: {attributes.loading}\n` +
        `Number of Reg (Regular): {attributes.regular}\n` +
        `Number of RNS (Reserved): {attributes.reserved}\n` +
        `Number of Other: {attributes.other}\n` +
        `Number of Accessible: {attributes.accessible}\n` +
        `Number of M/C (Motorcycle): {attributes.motorcycle}\n` +
        `Number of Timed: {attributes.timed}\n` +
        `Number of Serv (Service): {attributes.service}\n` +
        `Number of UB: {attributes.ub}\n` +
        `Number of Visitor: {attributes.visitor}\n` +
        `Number of Visitor H/C: {attributes.visitorHc}\n` +
        `Number of RV: {attributes.rv}\n\n` +
        `---\n\n` +
        `Notes: {attributes.notes}`
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
    listMode: 'show',
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
            haloColor: [38, 38, 38, 255],
            haloSize: 1.5,
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
            haloColor: [38, 38, 38, 255],
            haloSize: 1.5,
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
            haloColor: [38, 38, 38, 255],
            haloSize: 1.5,
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
            haloColor: [38, 38, 38, 255],
            haloSize: 1.5,
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
          where: `Anno_Type = '2HR Timed' AND Rotation < 180`,
          labelExpressionInfo: {
            expression: `return '2 HOUR PARKING';`
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 40,
            color: [27, 94, 32, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1.5,
            font: {
              size: 6,
              family: 'Arial',
              weight: 'bold'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type = '2HR Timed' AND Rotation >= 180`,
          labelExpressionInfo: {
            expression: `return '2 HOUR PARKING';`
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 310,
            color: [27, 94, 32, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1.5,
            font: {
              size: 6,
              family: 'Arial',
              weight: 'bold'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type = 'Loading' AND Rotation < 180`,
          labelExpressionInfo: {
            expression: `return 'LOADING ZONE';`
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 40,
            color: [230, 115, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1.5,
            font: {
              size: 10,
              family: 'Arial',
              weight: 'bold'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'static'
        },
        {
          where: `Anno_Type = 'Loading' AND Rotation >= 180`,
          labelExpressionInfo: {
            expression: `return 'LOADING ZONE';`
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            angle: 310,
            color: [230, 115, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1.5,
            font: {
              size: 10,
              family: 'Arial',
              weight: 'bold'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'static'
        },
        {
          where: `Anno_Type IS NULL OR Anno_Type NOT IN ('Serv', 'M/C', 'H/C', '2HR Timed', 'Loading')`,
          labelExpressionInfo: {
            expression: `
              if ($feature.DeptSpc_YN != 1) { return ''; }
              // RNS_Num is the authoritative reserved-space number (e.g. '9640'); Spc_ID_Num
              // is only a fallback since it is empty in many lots.
              var num = Trim(Text($feature.RNS_Num));
              if (num == null || num == '' || num == 'null') { num = Trim(Text($feature.Spc_ID_Num)); }
              if (num == null || num == '' || num == 'null') { return 'DEPT. RESERVED'; }
              return 'DEPT. RESERVED' + TextFormatting.NewLine + num;
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            color: [80, 0, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1.5,
            font: {
              size: 8,
              family: 'Arial',
              weight: 'bold'
            }
          },
          minScale: 1200,
          maxScale: 0,
          deconflictionStrategy: 'none'
        },
        {
          where: `Anno_Type IS NULL OR Anno_Type NOT IN ('Serv', 'M/C', '2HR Timed', 'Loading')`,
          labelExpressionInfo: {
            expression: `
              if ($feature.Anno_Type == 'H/C') { return ''; }
              if ($feature.DeptSpc_YN == 1) { return ''; }
              // Show whichever space-number field is populated, in priority order. RNS_Num is
              // the reserved-numbered-space value and must win (it is the only populated field
              // for reserved spaces in many lots, e.g. Lot 96 '9608'/Lot 97 '97024'). VisSpcNum
              // is the visitor-space number, RV_SpcNum the RV number, and Spc_ID_Num a fallback.
              var rnsNum = Trim(Text($feature.RNS_Num));
              if (rnsNum != null && rnsNum != '' && rnsNum != 'null') { return rnsNum; }
              var visNum = Trim(Text($feature.VisSpcNum));
              if (visNum != null && visNum != '' && visNum != 'null') { return visNum; }
              var rvNum = Trim(Text($feature.RV_SpcNum));
              if (rvNum != null && rvNum != '' && rvNum != 'null') { return rvNum; }
              var spcId = Trim(Text($feature.Spc_ID_Num));
              if (spcId != null && spcId != '' && spcId != 'null') { return spcId; }
              return '';
            `
          },
          labelPlacement: 'center-center',
          symbol: {
            type: 'text',
            color: [255, 255, 255, 255],
            haloColor: [38, 38, 38, 255],
            haloSize: 1.5,
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
    showInQuickLinks: true,
    quickLinkOrder: 1,
    keywords: ['main', 'parking', 'map', 'lots', 'construction', 'bus', 'kiosk', 'rns', 'line paint']
  }
};
