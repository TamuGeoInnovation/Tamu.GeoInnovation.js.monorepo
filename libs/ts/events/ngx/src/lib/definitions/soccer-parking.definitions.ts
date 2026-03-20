import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SOCCER_PARKING_LAYERS {
  VISITOR_KIOSK = 'soccer-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'soccer-parking-accessible-parking',
  PARKING_LOTS = 'soccer-parking-lots',
  SAFETY_FIRST = 'soccer-parking-safety-first'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/SoccerParking/MapServer';

export const SoccerParkingDefinitions = {
  VISITOR_KIOSK: {
    id: SOCCER_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: SOCCER_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  PARKING: {
    id: SOCCER_PARKING_LAYERS.PARKING_LOTS,
    layerId: SOCCER_PARKING_LAYERS.PARKING_LOTS,
    name: 'Soccer Event Parking Lots',
    url: `${eventUrl}/2`
  },
  ACCESSIBLE_PARKING: {
    id: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  SAFETY_FIRST: {
    id: SOCCER_PARKING_LAYERS.SAFETY_FIRST,
    layerId: SOCCER_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const SoccerParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SoccerParkingDefinitions.VISITOR_KIOSK.id,
    title: SoccerParkingDefinitions.VISITOR_KIOSK.name,
    url: SoccerParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 12,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        label: 'Purchase Hourly Visitor Parking',
        symbol: {
          type: 'picture-marker',
          url: '/assets/images/icons/transportation/Paid-Parking.png',
          width: 22,
          height: 22
        } as unknown as esri.SymbolProperties
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoccerParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoccerParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SoccerParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 11,
    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoccerParkingDefinitions.PARKING.id,
    title: SoccerParkingDefinitions.PARKING.name,
    url: SoccerParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.SoccerN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 10,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'GIS.TS.SPEV_Lot_Use.Soccer',
        uniqueValueInfos: [
          {
            value: 'AnyValidRec',
            label: 'Rec Center Patrons Only',
            symbol: {
              type: 'simple-fill',
              color: [27, 72, 94, 255],
              outline: null
            } as unknown as esri.SymbolProperties
          },
          {
            value: 'EventParking',
            label: 'Event Parking',
            symbol: {
              type: 'simple-fill',
              color: [123, 35, 42, 255],
              outline: null
            } as unknown as esri.SymbolProperties
          }
        ]
      }
    }
  } as unknown as LayerSource,
  {
    type: 'map-image',
    id: SoccerParkingDefinitions.SAFETY_FIRST.id,
    title: SoccerParkingDefinitions.SAFETY_FIRST.name,
    url: eventUrl,
    visible: true,
    listMode: 'show',
    layerIndex: 9,
    native: {
      listMode: 'hide-children',
      sublayers: [
        {
          id: 3,
          title: SoccerParkingDefinitions.SAFETY_FIRST.name,
          visible: true,
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  }
];

export const SoccerParkingConfiguration: EventConfiguration = {
  id: 'soccer-parking',
  name: 'Soccer Parking',
  applicationName: 'Soccer Parking Map',
  shortApplicationName: 'Soccer Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M soccer events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SoccerParkingOptions: SpecialEventOptions = [];

const SoccerParkingLayerReferences: Record<string, string> = {
  VISITOR_KIOSK: SOCCER_PARKING_LAYERS.VISITOR_KIOSK,
  ACCESSIBLE_PARKING: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
  PARKING_LOTS: SOCCER_PARKING_LAYERS.PARKING_LOTS,
  SAFETY_FIRST: SOCCER_PARKING_LAYERS.SAFETY_FIRST
};

export const SoccerParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SoccerParkingConfiguration,
  options: SoccerParkingOptions,
  sources: SoccerParkingColdLayerSources,
  references: SoccerParkingLayerReferences,
  discover: {
    id: SoccerParkingConfiguration.id,
    name: SoccerParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M soccer events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['soccer', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
