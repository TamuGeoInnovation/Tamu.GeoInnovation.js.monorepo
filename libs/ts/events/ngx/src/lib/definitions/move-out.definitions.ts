import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';


export enum MOVE_OUT_LAYERS {
  CONSTRUCTION = 'Construction',
  NO_PARKING = 'No Parking Areas',
  STREET_PARKING = 'Move-Out Allowed Street Parking',
}


const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer';

export const MoveOutDefinitions = {
  CONSTRUCTION: {
    id: MOVE_OUT_LAYERS.CONSTRUCTION,
    layerId: MOVE_OUT_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  NO_PARKING: {
    id: MOVE_OUT_LAYERS.NO_PARKING,
    layerId: MOVE_OUT_LAYERS.NO_PARKING,
    name: 'No Parking Areas',
    url: `${eventUrl}/1`
  },
  STREET_PARKING: {
    id: MOVE_OUT_LAYERS.STREET_PARKING,
    layerId: MOVE_OUT_LAYERS.STREET_PARKING,
    name: 'Street Parking',
    url: `${eventUrl}/4`
  }
};

export const MoveOutColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveOutDefinitions.CONSTRUCTION.id,
    title: MoveOutDefinitions.CONSTRUCTION.name,
    url: MoveOutDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveOutDefinitions.NO_PARKING.id,
    title: MoveOutDefinitions.NO_PARKING.name,
    url: MoveOutDefinitions.NO_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveOutDefinitions.STREET_PARKING.id,
    title: MoveOutDefinitions.STREET_PARKING.name,
    url: MoveOutDefinitions.STREET_PARKING.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
];

export const MoveOutConfiguration: EventConfiguration = {
  id: 'move-out',
  name: 'Move Out',
  applicationName: 'Move Out Transportation Map',
  shortApplicationName: 'Move Out Map',
  mapCenter: [-96.34046, 30.60798],
  eventDates: [],
  zoom: 16
};

export const MoveOutOptions: SpecialEventOptions = [];


export const MoveOut: ISpecialEventRoot = {
  configuration: MoveOutConfiguration,
  options: MoveOutOptions,
  sources: MoveOutColdLayerSources,
  references: MOVE_OUT_LAYERS,
  discover: {
    id: MoveOutConfiguration.id,
    name: MoveOutConfiguration.name,
    description: 'Transportation and parking information for Move Out.',
    source: 'internal',
    type: 'event',
    keywords: ['move out', 'parking', 'transportation']
  }
};
