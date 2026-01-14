import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';


export enum MOVE_IN_LAYERS {
  CONSTRUCTION = 'Construction',
  NO_PARKING = 'No Parking Areas',
  STREET_PARKING = 'Move-In Allowed Street Parking',
  MOVE_IN_LOTS = 'Move-In Lots',
  MOVE_IN_POI = 'Move-In Points of Interest'
}


const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer';

export const MoveInDefinitions = {
  CONSTRUCTION: {
    id: MOVE_IN_LAYERS.CONSTRUCTION,
    layerId: MOVE_IN_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  NO_PARKING: {
    id: MOVE_IN_LAYERS.NO_PARKING,
    layerId: MOVE_IN_LAYERS.NO_PARKING,
    name: 'No Parking Areas',
    url: `${eventUrl}/1`
  },
  STREET_PARKING: {
    id: MOVE_IN_LAYERS.STREET_PARKING,
    layerId: MOVE_IN_LAYERS.STREET_PARKING,
    name: 'Street Parking',
    url: `${eventUrl}/5`
  },
    MOVE_IN_LOTS: {
    id: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    name: 'Move-In Lots',
    url: `${eventUrl}/6`
  },
    MOVE_IN_POI: {
    id: MOVE_IN_LAYERS.MOVE_IN_POI,
    layerId: MOVE_IN_LAYERS.MOVE_IN_POI,
    name: 'Move-In Points of Interest',
    url: `${eventUrl}/2`
  }
};

export const MoveInColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveInDefinitions.CONSTRUCTION.id,
    title: MoveInDefinitions.CONSTRUCTION.name,
    url: MoveInDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInDefinitions.NO_PARKING.id,
    title: MoveInDefinitions.NO_PARKING.name,
    url: MoveInDefinitions.NO_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveInDefinitions.STREET_PARKING.id,
    title: MoveInDefinitions.STREET_PARKING.name,
    url: MoveInDefinitions.STREET_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
    {
    type: 'feature',
    id: MoveInDefinitions.MOVE_IN_LOTS.id,
    title: MoveInDefinitions.MOVE_IN_LOTS.name,
    url: MoveInDefinitions.MOVE_IN_LOTS.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
    {
    type: 'feature',
    id: MoveInDefinitions.MOVE_IN_POI.id,
    title: MoveInDefinitions.MOVE_IN_POI.name,
    url: MoveInDefinitions.MOVE_IN_POI.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
];

export const MoveInConfiguration: EventConfiguration = {
  id: 'move-in',
  name: 'Move In',
  applicationName: 'Move In Transportation Map',
  introductionText: 'Get the best transportation and parking information for Move In Day.',
  shortApplicationName: 'Move In Map',
  mapCenter: [-96.34358, 30.61035],
  eventDates: [],
  zoom: 16
};

export const MoveInOptions: SpecialEventOptions = [];


export const MoveInTs: ISpecialEventRoot = {
  configuration: MoveInConfiguration,
  options: MoveInOptions,
  sources: MoveInColdLayerSources,
  references: MOVE_IN_LAYERS,
  discover: {
    id: MoveInConfiguration.id,
    name: MoveInConfiguration.name,
    description: 'Transportation and parking information for Move In Day.',
    source: 'internal',
    type: 'event',
    keywords: ['move in', 'parking', 'transportation']
  }
};