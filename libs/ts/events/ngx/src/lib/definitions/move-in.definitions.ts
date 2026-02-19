import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum MOVE_IN_LAYERS {
  MOVE_IN_POI = 'Move-In Points of Interest',
  MOVE_IN_STREETS = 'Move-In Streets',
  MOVE_IN_LOTS = 'Move-In Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/FallMoveInParking/MapServer';

export const MoveInDefinitions = {
  MOVE_IN_POI: {
    id: MOVE_IN_LAYERS.MOVE_IN_POI,
    layerId: MOVE_IN_LAYERS.MOVE_IN_POI,
    name: 'Move-In Points of Interest',
    url: `${eventUrl}/0`
  },
  MOVE_IN_STREETS: {
    id: MOVE_IN_LAYERS.MOVE_IN_STREETS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_STREETS,
    name: 'Move-In Streets',
    url: `${eventUrl}/1`
  },
  MOVE_IN_LOTS: {
    id: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    layerId: MOVE_IN_LAYERS.MOVE_IN_LOTS,
    name: 'Move-In Lots',
    url: `${eventUrl}/2`
  }
};

export const MoveInColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveInDefinitions.MOVE_IN_STREETS.id,
    title: MoveInDefinitions.MOVE_IN_STREETS.name,
    url: MoveInDefinitions.MOVE_IN_STREETS.url,
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
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      /**
       * Notes requested from column: MoveInN
       */
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.MoveInN',
        collapsed: true
      }
    },
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
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: {
        field: 'Note',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
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

export const MoveInTs: AggiemapCustomMapConfiguration = {
  configuration: MoveInConfiguration,
  options: MoveInOptions,
  sources: MoveInColdLayerSources,
  references: MOVE_IN_LAYERS,
  type: 'general-map',
  discover: {
    id: MoveInConfiguration.id,
    name: MoveInConfiguration.name,
    description: 'Transportation and parking information for Fall Move In.',
    source: 'internal',
    type: 'parking',
    keywords: ['move in', 'fall move in', 'parking', 'transportation']
  }
};
