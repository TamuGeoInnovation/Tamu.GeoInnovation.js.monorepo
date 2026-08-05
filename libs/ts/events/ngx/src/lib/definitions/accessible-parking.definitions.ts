import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum ACCESSIBLE_PARKING_LAYERS {
  ACCESSIBLE_PARKING_SPACE = 'Accessible Parking Space'
}

const eventUrl = Connections.accessibleParkingUrl;

export const AccessibleParkingDefinitions = {
  ACCESSIBLE_PARKING_SPACE: {
    id: ACCESSIBLE_PARKING_LAYERS.ACCESSIBLE_PARKING_SPACE,
    layerId: ACCESSIBLE_PARKING_LAYERS.ACCESSIBLE_PARKING_SPACE,
    name: 'Accessible Parking Space',
    url: `${eventUrl}/0`
  }
};

export const AccessibleParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AccessibleParkingDefinitions.ACCESSIBLE_PARKING_SPACE.id,
    title: AccessibleParkingDefinitions.ACCESSIBLE_PARKING_SPACE.name,
    url: AccessibleParkingDefinitions.ACCESSIBLE_PARKING_SPACE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const AccessibleParkingConfiguration: EventConfiguration = {
  id: 'accessible-parking',
  name: 'Accessible Parking',
  applicationName: 'Accessible Parking Map',
  shortApplicationName: 'Accessible Parking',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const AccessibleParkingOptions: SpecialEventOptions = [];

export const AccessibleParkingTs: AggiemapCustomMapConfiguration = {
  configuration: AccessibleParkingConfiguration,
  options: AccessibleParkingOptions,
  sources: AccessibleParkingColdLayerSources,
  references: ACCESSIBLE_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: AccessibleParkingConfiguration.id,
    name: AccessibleParkingConfiguration.name,
    description: 'Accessible parking spaces.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'general',
    showInQuickLinks: true,
    keywords: ['accessible', 'parking', 'handicap', 'ada']
  }
};
