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

export enum SOFTBALL_PARKING_LAYERS {
  VISITOR_KIOSK = 'softball-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'softball-parking-accessible-parking',
  PARKING_LOTS = 'softball-parking-lots',
  SAFETY_FIRST = 'softball-parking-safety-first'
}

const eventUrl = Connections.softballParkingUrl;

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
      name: 'Visitor Permit Kiosk'
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
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Softball'`,
      renderer: {
        type: 'simple',
        label: 'Accessible Parking Spaces',
        symbol: accessibleParkingSymbol
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoftballParkingDefinitions.PARKING.id,
    title: SoftballParkingDefinitions.PARKING.name,
    url: SoftballParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'softballn',
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
    type: 'feature',
    id: SoftballParkingDefinitions.SAFETY_FIRST.id,
    title: SoftballParkingDefinitions.SAFETY_FIRST.name,
    url: SoftballParkingDefinitions.SAFETY_FIRST.url,
    visible: true,
    listMode: 'show',
    layerIndex: 0,
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

export const SoftballParkingConfiguration: EventConfiguration = {
  id: 'softball-parking',
  name: 'Softball',
  applicationName: 'Softball Parking',
  shortApplicationName: 'Softball Parking',
  introductionText: 'Parking and transportation information for Texas A&M softball games.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/softball/schedule',
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
    mapType: 'athletics',
    keywords: ['softball', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
