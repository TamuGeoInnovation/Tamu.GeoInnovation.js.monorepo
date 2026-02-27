import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum SOCCER_PARKING_LAYERS {
  ACCESSIBLE_PARKING = 'soccer-parking-accessible-parking',
  SAFETY_FIRST = 'soccer-parking-safety-first'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/SoccerParking/MapServer';

export const SoccerParkingDefinitions = {
  ACCESSIBLE_PARKING: {
    id: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  SAFETY_FIRST: {
    id: SOCCER_PARKING_LAYERS.SAFETY_FIRST,
    layerId: SOCCER_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const SoccerParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SoccerParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoccerParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SoccerParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: '**Event:** {attributes.Event}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SoccerParkingDefinitions.SAFETY_FIRST.id,
    title: SoccerParkingDefinitions.SAFETY_FIRST.name,
    url: SoccerParkingDefinitions.SAFETY_FIRST.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Crosswalk',
      description: '**Location:** {attributes.Location}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: "Street_Use = 'X-Walk'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [214, 170, 81, 255],
          width: 2,
          style: 'short-dash'
        }
      }
    }
  }
];

export const SoccerParkingConfiguration: EventConfiguration = {
  id: 'soccer-parking',
  name: 'Soccer Parking',
  applicationName: 'Soccer Parking Map',
  shortApplicationName: 'Soccer Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M soccer events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SoccerParkingOptions: SpecialEventOptions = [];

export const SoccerParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SoccerParkingConfiguration,
  options: SoccerParkingOptions,
  sources: SoccerParkingColdLayerSources,
  references: SOCCER_PARKING_LAYERS,
  discover: {
    id: SoccerParkingConfiguration.id,
    name: SoccerParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M soccer events.',
    source: 'internal',
    type: 'parking',
    keywords: ['soccer', 'parking', 'accessible', 'crosswalk']
  }
};
