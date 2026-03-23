import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SAVANNAH_BANANAS_PARKING_LAYERS {
  PEDESTRIAN_PATH = 'savannah-bananas-pedestrian-path',
  PARKING_LOTS = 'savannah-bananas-parking-lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Maroon_White_Game/MapServer'; // replace with actual event URL when available

export const SavannahBananasParkingDefinitions = {
  PEDESTRIAN_PATH: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.PEDESTRIAN_PATH,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.PEDESTRIAN_PATH,
    name: 'Pedestrian Path',
    url: `${eventUrl}/0`
  },
  PARKING_LOTS: {
    id: SAVANNAH_BANANAS_PARKING_LAYERS.PARKING_LOTS,
    layerId: SAVANNAH_BANANAS_PARKING_LAYERS.PARKING_LOTS,
    name: 'Savannah Bananas Parking Lots',
    url: `${eventUrl}/1`
  }
};

const BananaPalette = {
  bananaBright: [252, 227, 0, 0.62],
  bananaGold: [255, 196, 0, 0.62],
  bananaCream: [255, 244, 180, 0.6],
  peelGreen: [108, 190, 69, 0.62],
  limeGreen: [168, 220, 60, 0.62],
  tailgaterOrange: [255, 140, 0, 0.62],
  navy: [20, 35, 90, 0.55],
  closureRed: [230, 0, 0, 0.75],
  outlineDark: [0, 0, 0, 0.6]
};

const BananasParkingLotsRenderer = {
  type: 'unique-value',
  field: 'Type',
  defaultLabel: 'Parking',
  defaultSymbol: {
    type: 'simple-fill',
    style: 'solid',
    color: BananaPalette.bananaCream,
    outline: { color: BananaPalette.outlineDark, width: '1' }
  } as unknown as esri.SimpleFillSymbolProperties,
  uniqueValueInfos: [
    {
      value: '$10 Parking or Any Valid Texas A&M Permit',
      label: '$10 Parking or Any Valid Texas A&M Permit',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.bananaBright,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    },
    {
      value: '$10 Accessible/Event Parking',
      label: '$10 Accessible/Event Parking',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.peelGreen,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    },
    {
      value: '$10 Event Parking',
      label: '$10 Event Parking',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.bananaGold,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    },
    {
      value: 'Lot Specific Permit Only',
      label: 'Lot Specific Permit Only',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.navy,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    },
    {
      value: 'Reserved/$10 Accessible',
      label: 'Reserved/$10 Accessible',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.limeGreen,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    },
    {
      value: 'Reserved',
      label: 'Reserved',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.tailgaterOrange,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    },
    {
      value: 'Closure',
      label: 'Closure',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: BananaPalette.closureRed,
        outline: { color: BananaPalette.outlineDark, width: '1' }
      } as unknown as esri.SimpleFillSymbolProperties
    }
  ]
} as unknown;

export const SavannahBananasParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SavannahBananasParkingDefinitions.PEDESTRIAN_PATH.id,
    title: SavannahBananasParkingDefinitions.PEDESTRIAN_PATH.name,
    url: SavannahBananasParkingDefinitions.PEDESTRIAN_PATH.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '{attributes.description}'
    },
    visible: true,
    listMode: 'show',

    layerIndex: 49,

    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SavannahBananasParkingDefinitions.PARKING_LOTS.id,
    title: SavannahBananasParkingDefinitions.PARKING_LOTS.name,
    url: SavannahBananasParkingDefinitions.PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.Type',
      description: '{attributes.description}\n{attributes.Notes}'
    },
    visible: true,
    listMode: 'show',

    layerIndex: 50,

    native: {
      outFields: ['*'],
      renderer: BananasParkingLotsRenderer
    }
  } as unknown as LayerSource
];

export const SavannahBananasParkingConfiguration: EventConfiguration = {
  id: 'savannah-bananas-parking',
  name: 'Savannah Bananas Parking',
  applicationName: 'Savannah Bananas Parking Map',
  shortApplicationName: 'Savannah Bananas Parking',
  introductionText: 'Parking and transportation info for Savannah Bananas vs Texas Tailgaters at Kyle Field.',
  eventDates: ['2026-05-02'],
  mapCenter: [-96.34046, 30.60798],
  zoom: 16
};

export const SavannahBananasParkingOptions: SpecialEventOptions = [];

export const SavannahBananasParkingTs: AggiemapCustomMapConfiguration = {
  configuration: SavannahBananasParkingConfiguration,
  options: SavannahBananasParkingOptions,
  sources: SavannahBananasParkingColdLayerSources,
  references: SAVANNAH_BANANAS_PARKING_LAYERS,
  type: 'special-event',
  discover: {
    id: SavannahBananasParkingConfiguration.id,
    name: SavannahBananasParkingConfiguration.name,
    description: 'Transportation and parking information for Savannah Bananas vs Texas Tailgaters at Kyle Field.',
    source: 'internal',
    type: 'event',
    mapType: 'athletics',
    keywords: ['savannah bananas', 'texas tailgaters', 'kyle field', 'parking', 'transportation']
  }
};
