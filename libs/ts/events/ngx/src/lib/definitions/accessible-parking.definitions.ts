import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum ACCESSIBLE_PARKING_LAYERS {
  CONSTRUCTION = 'Construction',
  ACCESSIBLE_SPACES_IN_AREA = 'Accessible Spaces in this area',
  ACCESSIBLE_PARKING_SPACE = 'Accessible Parking Space'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/DisabledTimedMotorcycle/MapServer';

export const AccessibleParkingDefinitions = {
  CONSTRUCTION: {
    id: ACCESSIBLE_PARKING_LAYERS.CONSTRUCTION,
    layerId: ACCESSIBLE_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_SPACES_IN_AREA: {
    id: ACCESSIBLE_PARKING_LAYERS.ACCESSIBLE_SPACES_IN_AREA,
    layerId: ACCESSIBLE_PARKING_LAYERS.ACCESSIBLE_SPACES_IN_AREA,
    name: 'Accessible Spaces in this area',
    url: `${eventUrl}/8`
  },
  ACCESSIBLE_PARKING_SPACE: {
    id: ACCESSIBLE_PARKING_LAYERS.ACCESSIBLE_PARKING_SPACE,
    layerId: ACCESSIBLE_PARKING_LAYERS.ACCESSIBLE_PARKING_SPACE,
    name: 'Accessible Parking Space',
    url: `${eventUrl}/9`
  }
};

export const AccessibleParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AccessibleParkingDefinitions.CONSTRUCTION.id,
    title: AccessibleParkingDefinitions.CONSTRUCTION.name,
    url: AccessibleParkingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },

  /**
   * NOTE:
   * MapServer layer 7 is a GROUP layer ("Accessible Parking") with no geometry.
   * Do not include it, otherwise AggieMap will show a toggleable layer.
   */

  {
    type: 'feature',
    id: AccessibleParkingDefinitions.ACCESSIBLE_SPACES_IN_AREA.id,
    title: AccessibleParkingDefinitions.ACCESSIBLE_SPACES_IN_AREA.name,
    url: AccessibleParkingDefinitions.ACCESSIBLE_SPACES_IN_AREA.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
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

export const AccessibleParkingTs: ISpecialEventRoot = {
  configuration: AccessibleParkingConfiguration,
  options: AccessibleParkingOptions,
  sources: AccessibleParkingColdLayerSources,
  references: ACCESSIBLE_PARKING_LAYERS,
  discover: {
    id: AccessibleParkingConfiguration.id,
    name: AccessibleParkingConfiguration.name,
    description: 'Accessible parking areas and spaces (including construction overlays).',
    source: 'internal',
    type: 'event',
    keywords: ['accessible', 'disability', 'parking', 'handicap']
  }
};
