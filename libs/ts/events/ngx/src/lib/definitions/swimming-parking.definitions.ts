import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { createAthleticsSymbol } from './athletics-symbols.definitions';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SWIMMING_PARKING_LAYERS {
  VISITOR_KIOSK = 'swimming-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'swimming-parking-accessible-parking',
  PARKING_LOTS = 'swimming-parking-lots',
  SAFETY_FIRST = 'swimming-parking-safety-first'
}

const eventUrl = Connections.swimmingParkingUrl;

/**
 * The hosted views expose a campus-wide symbol table and the campus-wide street striping table,
 * so every layer sourced from them has to be narrowed down to this event on the client.
 */
const accessibleParkingSymbol = createAthleticsSymbol('ACCESSIBLE_PARKING');

const crosswalkSymbol = {
  type: 'simple-line',
  color: [214, 170, 81, 255],
  width: 2,
  style: 'short-dash'
} as unknown as esri.SymbolProperties;

export const SwimmingParkingDefinitions = {
  VISITOR_KIOSK: {
    id: SWIMMING_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: SWIMMING_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: SWIMMING_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: SWIMMING_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: SWIMMING_PARKING_LAYERS.PARKING_LOTS,
    layerId: SWIMMING_PARKING_LAYERS.PARKING_LOTS,
    name: 'Swimming Event Parking Lots',
    url: `${eventUrl}/2`
  },
  SAFETY_FIRST: {
    id: SWIMMING_PARKING_LAYERS.SAFETY_FIRST,
    layerId: SWIMMING_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const SwimmingParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SwimmingParkingDefinitions.VISITOR_KIOSK.id,
    title: SwimmingParkingDefinitions.VISITOR_KIOSK.name,
    url: SwimmingParkingDefinitions.VISITOR_KIOSK.url,
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
    id: SwimmingParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SwimmingParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SwimmingParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Swimming'`,
      renderer: {
        type: 'simple',
        label: 'Accessible Parking Spaces',
        symbol: accessibleParkingSymbol
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SwimmingParkingDefinitions.PARKING.id,
    title: SwimmingParkingDefinitions.PARKING.name,
    url: SwimmingParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'swimmingn',
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
        field: 'swimming',
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
            value: 'Hourly',
            label: 'Hourly Paid Parking',
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
    type: 'feature',
    id: SwimmingParkingDefinitions.SAFETY_FIRST.id,
    title: SwimmingParkingDefinitions.SAFETY_FIRST.name,
    url: SwimmingParkingDefinitions.SAFETY_FIRST.url,
    visible: true,
    listMode: 'show',
    layerIndex: 59,
    native: {
      outFields: ['*'],
      popupEnabled: false,
      definitionExpression: `street_use = 'X-Walk'`,
      renderer: {
        type: 'simple',
        label: 'Please use marked crosswalks. No mid-street crossing.',
        symbol: crosswalkSymbol
      }
    }
  } as unknown as LayerSource
];

export const SwimmingParkingConfiguration: EventConfiguration = {
  id: 'swimming-parking',
  name: 'Swimming',
  applicationName: 'Swimming Parking',
  shortApplicationName: 'Swimming Parking',
  introductionText: 'Parking and transportation information for Texas A&M swimming events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/swimdive/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SwimmingParkingOptions: SpecialEventOptions = [];

export const SwimmingParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SwimmingParkingConfiguration,
  options: SwimmingParkingOptions,
  sources: SwimmingParkingColdLayerSources,
  references: SWIMMING_PARKING_LAYERS,
  discover: {
    id: SwimmingParkingConfiguration.id,
    name: SwimmingParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M swimming events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['swimming', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
