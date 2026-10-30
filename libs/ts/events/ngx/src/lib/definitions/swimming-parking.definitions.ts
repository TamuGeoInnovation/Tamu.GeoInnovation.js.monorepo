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

export enum SWIMMING_PARKING_LAYERS {
  ACCESSIBLE_PARKING = 'swimming-parking-accessible-parking',
  PARKING_LOTS = 'swimming-parking-lots',
}

const eventUrl = Connections.swimmingParkingUrl;

export const SwimmingParkingDefinitions = {
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
  }
};

export const SwimmingParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SwimmingParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SwimmingParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SwimmingParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Swimming'`
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SwimmingParkingDefinitions.PARKING.id,
    url: SwimmingParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
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
    native: {
      outFields: ['*']
    }
  } as unknown as LayerSource,
];

/**
 * Swimming on the development GIS server (#2143).
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
const swimmingParkingDevelopmentIndex: Record<string, number> = {
  [SwimmingParkingDefinitions.ACCESSIBLE_PARKING.id]: 0,
  [SwimmingParkingDefinitions.PARKING.id]: 1
};

export const SwimmingParking_DevelopmentLayerSources: LayerSource[] = SwimmingParkingColdLayerSources.filter(
  (source) => (source as { id: string }).id in swimmingParkingDevelopmentIndex
).map((source) =>
  athleticsDevelopmentSource({
    id: (source as { id: string }).id,
    url: `${eventUrl}/${swimmingParkingDevelopmentIndex[(source as { id: string }).id]}`
  })
);

export const SwimmingParkingConfiguration: EventConfiguration = {
  id: 'swimming-parking',
  name: 'Swimming',
  applicationName: 'Swimming Parking',
  shortApplicationName: 'Swimming Parking',
  introductionText: 'Parking and transportation information for Texas A&M swimming events.',
  eventDates: ['2026-09-25', '2026-10-10', '2027-01-08', '2027-01-09', '2027-01-23'],
  scheduleUrl: 'https://12thman.com/sports/swimdive/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SwimmingParkingOptions: SpecialEventOptions = [];

export const SwimmingParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SwimmingParkingConfiguration,
  options: SwimmingParkingOptions,
  // One schema everywhere (#2453). The athletics services are being republished so that production
  // carries what development already does, and the old production columns are abandoned - so the
  // two-schema fork this map carried is gone and every environment reads these sources. The array
  // the old production sources lived in stays only where these are derived from it.
  sources: SwimmingParking_DevelopmentLayerSources,
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
