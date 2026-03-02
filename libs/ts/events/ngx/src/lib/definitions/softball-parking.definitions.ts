import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SOFTBALL_PARKING_LAYERS {
  VISITOR_KIOSK = 'softball-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'softball-parking-accessible-parking',
  PARKING_LOTS = 'softball-parking-lots',
  SAFETY_FIRST = 'softball-parking-safety-first'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/SoftballParking/MapServer';

export const SoftballParkingDefinitions = {
  VISITOR_KIOSK: {
    id: SOFTBALL_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: SOFTBALL_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: SOFTBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: SOFTBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: SOFTBALL_PARKING_LAYERS.PARKING_LOTS,
    layerId: SOFTBALL_PARKING_LAYERS.PARKING_LOTS,
    name: 'Softball Event Parking Lots',
    url: `${eventUrl}/2`
  },
  SAFETY_FIRST: {
    id: SOFTBALL_PARKING_LAYERS.SAFETY_FIRST,
    layerId: SOFTBALL_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const SoftballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SoftballParkingDefinitions.VISITOR_KIOSK.id,
    title: SoftballParkingDefinitions.VISITOR_KIOSK.name,
    url: SoftballParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
    },
    visible: true,
    listMode: 'show',
    layerIndex: 62,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SoftballParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoftballParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SoftballParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 61,
  },
  {
    type: 'feature',
    id: SoftballParkingDefinitions.PARKING.id,
    title: SoftballParkingDefinitions.PARKING.name,
    url: SoftballParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.SoftballN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 60,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'map-image',
    id: SoftballParkingDefinitions.SAFETY_FIRST.id,
    title: SoftballParkingDefinitions.SAFETY_FIRST.name,
    url: eventUrl,
    visible: true,
    listMode: 'show',
    layerIndex: 59,
    native: {
      listMode: 'hide-children',
      sublayers: [
        {
          id: 3,
          title: SoftballParkingDefinitions.SAFETY_FIRST.name,
          visible: true,
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  }
];

export const SoftballParkingConfiguration: EventConfiguration = {
  id: 'softball-parking',
  name: 'Softball Parking',
  applicationName: 'Softball Parking Map',
  shortApplicationName: 'Softball Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M softball games.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SoftballParkingOptions: SpecialEventOptions = [];

export const SoftballParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SoftballParkingConfiguration,
  options: SoftballParkingOptions,
  sources: SoftballParkingColdLayerSources,
  references: SOFTBALL_PARKING_LAYERS,
  discover: {
    id: SoftballParkingConfiguration.id,
    name: SoftballParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M softball events.',
    source: 'internal',
    type: 'parking',
    keywords: ['softball', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
