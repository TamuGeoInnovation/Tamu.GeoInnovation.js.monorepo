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
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'map-image',
    id: SoftballParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoftballParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: eventUrl,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: '{attributes.Event}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    native: {
      listMode: 'hide-children',
      sublayers: [
        {
          id: 1,
          title: SoftballParkingDefinitions.ACCESSIBLE_PARKING.name,
          visible: true,
          popupEnabled: true,
          renderer: {
            type: 'simple',
            label: 'Accessible Parking Spaces',
            symbol: {
              type: 'simple-marker',
              style: 'circle',
              size: 10,
              color: [38, 89, 150, 255],
              outline: {
                type: 'simple-line',
                color: [255, 255, 255, 255],
                width: 1
              }
            } as unknown as esri.SymbolProperties
          } as unknown as esri.RendererProperties
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
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
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SoftballParkingDefinitions.SAFETY_FIRST.id,
    title: SoftballParkingDefinitions.SAFETY_FIRST.name,
    url: SoftballParkingDefinitions.SAFETY_FIRST.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: "Street_Use = 'X-Walk'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [214, 170, 81, 255],
          width: 2,
          style: 'short-dash'
        }
      }
    }
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
