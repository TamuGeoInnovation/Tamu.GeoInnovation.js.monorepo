import { LayerSource } from '@tamu-gisc/common/types';

import { athleticsDevelopmentSource } from './common.definitions';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum TENNIS_PARKING_LAYERS {
  PARKING_LOTS = 'tennis-parking-lots'
}

const eventUrl = Connections.tennisParkingUrl;

export const TennisParkingDefinitions = {
  PARKING: {
    id: TENNIS_PARKING_LAYERS.PARKING_LOTS,
    layerId: TENNIS_PARKING_LAYERS.PARKING_LOTS,
    name: 'Tennis Event Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const TennisParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TennisParkingDefinitions.PARKING.id,
    url: TennisParkingDefinitions.PARKING.url,
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      /**
       * Notes requested from column: TennisN
       */
      description: {
        field: 'tennisn',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

/**
 * Tennis on the development GIS server (#2143).
 *
 * The development view holds the event lots alone - production's "Tennis Symbols" layer is not
 * published there - so the lots move from index 1 to index 0. Derived from the production sources so
 * the popups and draw order cannot drift from them.
 */
const tennisParkingDevelopmentIndex: Record<string, number> = {
  [TennisParkingDefinitions.PARKING.id]: 0
};

export const TennisParking_DevelopmentLayerSources: LayerSource[] = TennisParkingColdLayerSources.filter(
  (source) => (source as { id: string }).id in tennisParkingDevelopmentIndex
).map((source) =>
  athleticsDevelopmentSource({
    id: (source as { id: string }).id,
    url: `${eventUrl}/${tennisParkingDevelopmentIndex[(source as { id: string }).id]}`
  })
);

export const TennisParkingConfiguration: EventConfiguration = {
  id: 'tennis-parking',
  name: 'Tennis',
  applicationName: 'Tennis Parking',
  shortApplicationName: 'Tennis Parking',
  introductionText: 'Parking and transportation information for Texas A&M tennis events.',
  eventDates: [
    '2027-01-17',
    '2027-01-18',
    '2027-01-23',
    '2027-01-24',
    '2027-01-29',
    '2027-02-21',
    '2027-02-24',
    '2027-02-28',
    '2027-03-05',
    '2027-03-07',
    '2027-03-11',
    '2027-03-18',
    '2027-03-20',
    '2027-03-25',
    '2027-03-27',
    '2027-04-04',
    '2027-04-11',
    '2027-04-16',
    '2027-04-18'
  ],
  // The map is for both teams' home matches, published on two pages (#2050).
  scheduleUrl: ['https://12thman.com/sports/mens-tennis/schedule', 'https://12thman.com/sports/womens-tennis/schedule'],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const TennisParkingOptions: SpecialEventOptions = [];

export const TennisParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: TennisParkingConfiguration,
  options: TennisParkingOptions,
  // One schema everywhere (#2453). The athletics services are being republished so that production
  // carries what development already does, and the old production columns are abandoned - so the
  // two-schema fork this map carried is gone and every environment reads these sources. The array
  // the old production sources lived in stays only where these are derived from it.
  sources: TennisParking_DevelopmentLayerSources,
  references: TENNIS_PARKING_LAYERS,
  discover: {
    id: TennisParkingConfiguration.id,
    name: TennisParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M tennis events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['tennis', 'parking']
  }
};
