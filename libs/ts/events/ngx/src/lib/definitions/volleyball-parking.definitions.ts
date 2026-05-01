import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum VOLLEYBALL_PARKING_LAYERS {
  VISITOR_KIOSK = 'volleyball-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'volleyball-parking-accessible-parking',
  PARKING_LOTS = 'volleyball-parking-lots',
  SAFETY_FIRST = 'volleyball-parking-safety-first'
}

const eventUrl = Connections('gis.it.tamu.edu').volleyballParkingUrl;

export const VolleyballParkingDefinitions = {
  VISITOR_KIOSK: {
    id: VOLLEYBALL_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: VOLLEYBALL_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
    layerId: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
    name: 'Volleyball Event Parking Lots',
    url: `${eventUrl}/2`
  },
  SAFETY_FIRST: {
    id: VOLLEYBALL_PARKING_LAYERS.SAFETY_FIRST,
    layerId: VOLLEYBALL_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const VolleyballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.VISITOR_KIOSK.id,
    title: VolleyballParkingDefinitions.VISITOR_KIOSK.name,
    url: VolleyballParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 62,
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
    id: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.PARKING.id,
    title: VolleyballParkingDefinitions.PARKING.name,
    url: VolleyballParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.VolelyballN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 60,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'GIS.TS.SPEV_Lot_Use.Volleyball',
        defaultLabel: 'Accessible Parking Only',
        defaultSymbol: {
          type: 'simple-fill',
          color: [241, 184, 96, 255],
          outline: null
        } as unknown as esri.SymbolProperties,
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
    id: VolleyballParkingDefinitions.SAFETY_FIRST.id,
    title: VolleyballParkingDefinitions.SAFETY_FIRST.name,
    url: eventUrl,
    visible: true,
    listMode: 'show',
    layerIndex: 59,
    native: {
      listMode: 'hide-children',
      sublayers: [
        {
          id: 3,
          title: VolleyballParkingDefinitions.SAFETY_FIRST.name,
          visible: true,
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  }
];

export const VolleyballParkingConfiguration: EventConfiguration = {
  id: 'volleyball-parking',
  name: 'Volleyball Map',
  applicationName: 'Volleyball Parking Map',
  shortApplicationName: 'Volleyball Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M volleyball events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/womens-volleyball/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const VolleyballParkingOptions: SpecialEventOptions = [];

const VolleyballParkingLayerReferences: Record<string, string> = {
  VISITOR_KIOSK: VOLLEYBALL_PARKING_LAYERS.VISITOR_KIOSK,
  ACCESSIBLE_PARKING: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
  PARKING_LOTS: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
  SAFETY_FIRST: VOLLEYBALL_PARKING_LAYERS.SAFETY_FIRST
};

export const VolleyballParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: VolleyballParkingConfiguration,
  options: VolleyballParkingOptions,
  sources: VolleyballParkingColdLayerSources,
  references: VolleyballParkingLayerReferences,
  discover: {
    id: VolleyballParkingConfiguration.id,
    name: VolleyballParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M volleyball events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['volleyball', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
