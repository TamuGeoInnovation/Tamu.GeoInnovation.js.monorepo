import { LayerSource } from '@tamu-gisc/common/types';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum TIMED_PARKING_LAYERS {
  TIMED_PARKING_AREA = 'Timed Parking in this area',
  TIMED_PARKING_SPACE = 'Timed Parking Space'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/DisabledTimedMotorcycle/MapServer';

export const TimedParkingDefinitions = {
  TIMED_PARKING_AREA: {
    id: TIMED_PARKING_LAYERS.TIMED_PARKING_AREA,
    layerId: TIMED_PARKING_LAYERS.TIMED_PARKING_AREA,
    name: 'Timed Spaces in this area',
    url: `${eventUrl}/5`
  },
  TIMED_PARKING_SPACE: {
    id: TIMED_PARKING_LAYERS.TIMED_PARKING_SPACE,
    layerId: TIMED_PARKING_LAYERS.TIMED_PARKING_SPACE,
    name: 'Timed Parking Space',
    url: `${eventUrl}/6`
  }
};

export const TimedParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: TimedParkingDefinitions.TIMED_PARKING_AREA.id,
    title: TimedParkingDefinitions.TIMED_PARKING_AREA.name,
    url: TimedParkingDefinitions.TIMED_PARKING_AREA.url,
    // popupComponent: MarkdownPopupComponent,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: TimedParkingDefinitions.TIMED_PARKING_SPACE.id,
    title: TimedParkingDefinitions.TIMED_PARKING_SPACE.name,
    url: TimedParkingDefinitions.TIMED_PARKING_SPACE.url,
    // popupComponent: MarkdownPopupComponent,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*']
    }
  }
];

export const TimedParkingConfiguration: EventConfiguration = {
  id: 'timed-parking',
  name: 'Timed Parking',
  applicationName: 'Areas with Timed Parking',
  shortApplicationName: 'Timed Parking Map',
  eventDates: [],
  mapCenter: [-96.33771, 30.62143]
};

export const TimedParkingOptions: SpecialEventOptions = [];

export const TimedParking_Ts: AggiemapCustomMapConfiguration = {
  configuration: TimedParkingConfiguration,
  options: TimedParkingOptions,
  sources: TimedParkingColdLayerSources,
  references: TIMED_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: TimedParkingConfiguration.id,
    name: TimedParkingConfiguration.name,
    description: 'Areas with timed parking on campus.',
    source: 'internal',
    type: 'general',
    keywords: ['timed', 'parking', 'transportation', '30 minute', '30 min']
  }
};
