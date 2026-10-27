import { LayerSource } from '@tamu-gisc/common/types';

import { athleticsDevelopmentSource } from './common.definitions';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;
import { EventPopups } from '../modules/popups/popups';

export enum SOFTBALL_PARKING_LAYERS {
  VISITOR_KIOSK = 'softball-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'softball-parking-accessible-parking',
  PARKING_LOTS = 'softball-parking-lots',
  SAFETY_FIRST = 'softball-parking-safety-first'
}

const eventUrl = Connections.softballParkingUrl;

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
    popupComponent: EventPopups.MarkdownPopupComponent,
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
    popupComponent: EventPopups.MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 61,
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Softball'`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoftballParkingDefinitions.PARKING.id,
    url: SoftballParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
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
      definitionExpression: `street_use = 'X-Walk'`
    }
  } as unknown as LayerSource
];

/**
 * Softball on the development GIS server (#2143).
 *
 * The GIS team republished this map as a hosted view with **two** layers, having removed the visitor
 * kiosk and the crosswalk ("Safety First") layers and renamed the accessible one. Production still
 * serves the four-layer version until they publish there, so this stands beside the sources above
 * rather than replacing them; `event-settings.service.ts` chooses between them.
 *
 * **Derived from the production sources rather than written out again**, so the two cannot drift: the
 * popups, definition expressions and draw order are the same objects, and only the layer index moves.
 * `eventUrl` already resolves to the development host, because `athleticsHost` in `connections.ts` does.
 *
 * The view's own indexes: Accessible Parking Spaces is 0 here and 1 on production, the lots 1 here and 2.
 */
const softballParkingDevelopmentIndex: Record<string, number> = {
  [SoftballParkingDefinitions.ACCESSIBLE_PARKING.id]: 0,
  [SoftballParkingDefinitions.PARKING.id]: 1
};

export const SoftballParking_DevelopmentLayerSources: LayerSource[] = SoftballParkingColdLayerSources.filter(
  (source) => (source as { id: string }).id in softballParkingDevelopmentIndex
).map((source) =>
  athleticsDevelopmentSource({
    id: (source as { id: string }).id,
    url: `${eventUrl}/${softballParkingDevelopmentIndex[(source as { id: string }).id]}`,
    layerIndex: (source as { layerIndex?: number }).layerIndex
  })
);

export const SoftballParkingConfiguration: EventConfiguration = {
  id: 'softball-parking',
  name: 'Softball',
  applicationName: 'Softball Parking',
  shortApplicationName: 'Softball Parking',
  introductionText: 'Parking and transportation information for Texas A&M softball games.',
  eventDates: [
    '2026-10-22',
    '2026-10-30',
    '2026-11-04',
    '2026-11-06',
    '2027-03-12',
    '2027-03-13',
    '2027-03-14',
    '2027-04-02',
    '2027-04-03',
    '2027-04-04',
    '2027-04-23',
    '2027-04-24',
    '2027-04-25',
    '2027-05-06',
    '2027-05-07',
    '2027-05-08'
  ],
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
  developmentSources: SoftballParking_DevelopmentLayerSources,
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
