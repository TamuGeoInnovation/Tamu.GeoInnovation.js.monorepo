import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum BASEBALL_PARKING_LAYERS {
  BASEBALL_SYMBOLS = 'baseball-symbols',
  SHUTTLE_ROUTE = 'baseball-shuttle-route',
  BASEBALL_GATES = 'baseball-gates',
  BASEBALL_EVENT_PARKING_LOTS = 'baseball-event-parking-lots'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/BaseballParking/MapServer';

const BaseballParkingEventDefinitions = {
  BASEBALL_SYMBOLS: {
    id: BASEBALL_PARKING_LAYERS.BASEBALL_SYMBOLS,
    layerId: BASEBALL_PARKING_LAYERS.BASEBALL_SYMBOLS,
    name: 'Baseball Symbols',
    url: `${eventUrl}/0`
  },
  SHUTTLE_ROUTE: {
    id: BASEBALL_PARKING_LAYERS.SHUTTLE_ROUTE,
    layerId: BASEBALL_PARKING_LAYERS.SHUTTLE_ROUTE,
    name: 'Shuttle Route',
    url: `${eventUrl}/1`
  },
  BASEBALL_GATES: {
    id: BASEBALL_PARKING_LAYERS.BASEBALL_GATES,
    layerId: BASEBALL_PARKING_LAYERS.BASEBALL_GATES,
    name: 'Baseball Gates',
    url: `${eventUrl}/2`
  },
  BASEBALL_EVENT_PARKING_LOTS: {
    id: BASEBALL_PARKING_LAYERS.BASEBALL_EVENT_PARKING_LOTS,
    layerId: BASEBALL_PARKING_LAYERS.BASEBALL_EVENT_PARKING_LOTS,
    name: 'Baseball Event Parking Lots',
    url: `${eventUrl}/3`
  }
};

export const BaseballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BaseballParkingEventDefinitions.BASEBALL_EVENT_PARKING_LOTS.id,
    title: BaseballParkingEventDefinitions.BASEBALL_EVENT_PARKING_LOTS.name,
    url: BaseballParkingEventDefinitions.BASEBALL_EVENT_PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.BaseballN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BaseballParkingEventDefinitions.BASEBALL_GATES.id,
    title: BaseballParkingEventDefinitions.BASEBALL_GATES.name,
    url: BaseballParkingEventDefinitions.BASEBALL_GATES.url,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BaseballParkingEventDefinitions.SHUTTLE_ROUTE.id,
    title: BaseballParkingEventDefinitions.SHUTTLE_ROUTE.name,
    url: BaseballParkingEventDefinitions.SHUTTLE_ROUTE.url,
    popupComponent: MarkdownPopupComponent,

    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BaseballParkingEventDefinitions.BASEBALL_SYMBOLS.id,
    title: BaseballParkingEventDefinitions.BASEBALL_SYMBOLS.name,
    url: BaseballParkingEventDefinitions.BASEBALL_SYMBOLS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.Type}'
    },
    native: {
      outFields: ['*']
    }
  }
];

export const BaseballParkingConfiguration: EventConfiguration = {
  id: 'baseball-parking',
  name: 'Baseball Parking',
  applicationName: 'Baseball Parking Map',
  shortApplicationName: 'Baseball Parking',
  introductionText: 'Parking and access information for Texas A&M baseball home games.',
  eventDates: [
    '2026-02-13',
    '2026-02-14',
    '2026-02-15',
    '2026-02-17',
    '2026-02-20',
    '2026-02-21',
    '2026-02-22',
    '2026-02-24',
    '2026-03-03',
    '2026-03-06',
    '2026-03-07',
    '2026-03-08',
    '2026-03-10',
    '2026-03-17',
    '2026-03-20',
    '2026-03-21',
    '2026-03-22',
    '2026-03-24',
    '2026-03-31',
    '2026-04-02',
    '2026-04-03',
    '2026-04-04',
    '2026-04-10',
    '2026-04-11',
    '2026-04-12',
    '2026-04-14',
    '2026-04-21',
    '2026-04-28',
    '2026-05-01',
    '2026-05-02',
    '2026-05-03',
    '2026-05-05',
    '2026-05-14',
    '2026-05-15',
    '2026-05-16'
  ],
  mapCenter: [-96.34509, 30.60416],
  zoom: 17,
  toast: {
    id: 'baseball-parking-notification',
    title: 'Baseball Parking Map Available',
    message: 'Headed to the game? Click to open the Baseball Parking Map for parking, gates, and shuttle information.',
    imgUrl: './assets/images/icons/sports/Baseball.png',
    imgAltText: 'Baseball Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/baseball-parking'
    }
  }
};

export const BaseballParkingOptions: SpecialEventOptions = [];

export const BaseballParkingTs: ISpecialEventRoot = {
  configuration: BaseballParkingConfiguration,
  options: BaseballParkingOptions,
  sources: BaseballParkingColdLayerSources,
  references: BASEBALL_PARKING_LAYERS,
  discover: {
    id: BaseballParkingConfiguration.id,
    name: BaseballParkingConfiguration.name,
    description: 'Parking and access information for Texas A&M baseball home games.',
    source: 'internal',
    type: 'event',
    keywords: ['baseball', 'parking', 'transportation', 'shuttle', 'gates']
  }
};
