import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum MAROON_WHITE_GAME_LAYERS {
  ACCESSIBLE_PREPAID_PARKING = 'maroon-white-game-accessible-prepaid-parking',
  EVENT_PARKING_LOTS = 'maroon-white-game-event-parking-lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Maroon_White_Game/MapServer';

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

const ACCESSIBLE_PARKING_IMAGE_DATA =
  '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';
const PARKMOBILE_PREPAID_PARKING_IMAGE_DATA =
  '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';
const ACCESSIBLE_PARKING_ICON_WIDTH = 28;
const ACCESSIBLE_PARKING_ICON_HEIGHT = (ACCESSIBLE_PARKING_ICON_WIDTH * 39) / 32;
// Preserve the published 33x40 pin aspect ratio instead of forcing the art into a square.
const PARKMOBILE_PREPAID_PARKING_ICON_WIDTH = 28;
const PARKMOBILE_PREPAID_PARKING_ICON_HEIGHT = (PARKMOBILE_PREPAID_PARKING_ICON_WIDTH * 40) / 33;

const eventParkingLotSymbol = {
  type: 'simple-fill',
  color: [81, 179, 54, 255],
  outline: {
    type: 'simple-line',
    color: [68, 137, 112, 255],
    width: 1
  }
} as unknown as esri.SymbolProperties;

const reservedParkingLotSymbol = {
  type: 'simple-fill',
  color: [242, 160, 97, 255],
  outline: {
    type: 'simple-line',
    color: [230, 124, 0, 255],
    width: 1
  }
} as unknown as esri.SymbolProperties;

const roadClosedSymbol = {
  type: 'simple-fill',
  style: 'backward-diagonal',
  color: [230, 0, 0, 255],
  outline: {
    type: 'simple-line',
    color: [230, 0, 0, 255],
    width: 1
  }
} as unknown as esri.SymbolProperties;

const createPictureMarkerSymbol = (url: string, width: number, height: number): esri.SymbolProperties =>
  ({
    type: 'picture-marker',
    url,
    width,
    height
  }) as unknown as esri.SymbolProperties;

const maroonWhiteAccessiblePrepaidParkingRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'name',
  uniqueValueInfos: [
    {
      value: 'Accessible Parking',
      label: 'Accessible Parking',
      // Preserve the published 32x40 pin aspect ratio instead of forcing the art into a square.
      symbol: createPictureMarkerSymbol(
        `data:image/png;base64,${ACCESSIBLE_PARKING_IMAGE_DATA}`,
        ACCESSIBLE_PARKING_ICON_WIDTH,
        ACCESSIBLE_PARKING_ICON_HEIGHT
      )
    },
    {
      value: 'ParkMobile Prepaid Parking',
      label: 'ParkMobile Prepaid Parking',
      // Use clean local SVG art here because the service PNG produces visible artifacts in AggieMap legend swatches.
      symbol: createPictureMarkerSymbol(
        `data:image/png;base64,${PARKMOBILE_PREPAID_PARKING_IMAGE_DATA}`,
        PARKMOBILE_PREPAID_PARKING_ICON_WIDTH,
        PARKMOBILE_PREPAID_PARKING_ICON_HEIGHT
      )
    }
  ]
};

const maroonWhiteEventParkingLotsRenderer: FeatureRenderer = {
  type: 'unique-value',
  field: 'Type',
  uniqueValueInfos: [
    {
      value: 'Event Parking',
      label: 'Event Parking',
      symbol: eventParkingLotSymbol
    },
    {
      value: 'Reserved',
      label: 'Reserved',
      symbol: reservedParkingLotSymbol
    },
    {
      value: 'Lot Specific Permit Only',
      label: 'Reserved',
      symbol: reservedParkingLotSymbol
    },
    {
      value: 'Closure',
      label: 'Road Closed (Pedestrian Zone)',
      symbol: roadClosedSymbol
    }
  ]
};

export const MaroonWhiteGameDefinitions = {
  ACCESSIBLE_PREPAID_PARKING: {
    id: MAROON_WHITE_GAME_LAYERS.ACCESSIBLE_PREPAID_PARKING,
    layerId: MAROON_WHITE_GAME_LAYERS.ACCESSIBLE_PREPAID_PARKING,
    name: 'Accessible/PrePaid Parking',
    url: `${eventUrl}/0`
  },
  EVENT_PARKING_LOTS: {
    id: MAROON_WHITE_GAME_LAYERS.EVENT_PARKING_LOTS,
    layerId: MAROON_WHITE_GAME_LAYERS.EVENT_PARKING_LOTS,
    name: 'Event Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const MaroonWhiteGameColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MaroonWhiteGameDefinitions.EVENT_PARKING_LOTS.id,
    title: MaroonWhiteGameDefinitions.EVENT_PARKING_LOTS.name,
    url: MaroonWhiteGameDefinitions.EVENT_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: maroonWhiteEventParkingLotsRenderer
    } as unknown as FeatureNative
  },
  {
    type: 'feature',
    id: MaroonWhiteGameDefinitions.ACCESSIBLE_PREPAID_PARKING.id,
    title: MaroonWhiteGameDefinitions.ACCESSIBLE_PREPAID_PARKING.name,
    url: MaroonWhiteGameDefinitions.ACCESSIBLE_PREPAID_PARKING.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: maroonWhiteAccessiblePrepaidParkingRenderer
    } as unknown as FeatureNative
  }
];

export const MaroonWhiteGameConfiguration: EventConfiguration = {
  id: 'maroon-white-game-2026',
  name: 'Maroon & White Game',
  applicationName: 'Maroon & White Game Transportation Map',
  shortApplicationName: 'Maroon & White Game Map',
  introductionText: 'Get the best parking information for',
  eventDates: ['2026-04-18'],
  scheduleUrl: 'https://12thman.com/sports/football/schedule',
  mapCenter: [-96.34046, 30.60798],
  zoom: 16
};

export const MaroonWhiteGameOptions: SpecialEventOptions = [];

export const MaroonWhiteTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: MaroonWhiteGameConfiguration,
  options: MaroonWhiteGameOptions,
  sources: MaroonWhiteGameColdLayerSources,
  references: MAROON_WHITE_GAME_LAYERS,
  discover: {
    id: MaroonWhiteGameConfiguration.id,
    name: MaroonWhiteGameConfiguration.name,
    description: 'Transportation and parking information for the Maroon & White Game.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['maroon', 'white', 'game', 'parking', 'transportation']
  }
};
