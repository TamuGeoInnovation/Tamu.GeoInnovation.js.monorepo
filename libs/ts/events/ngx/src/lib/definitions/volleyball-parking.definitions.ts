import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum VOLLEYBALL_PARKING_LAYERS {
  VISITOR_KIOSK = 'volleyball-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'volleyball-parking-accessible-parking',
  PARKING_LOTS = 'volleyball-parking-lots',
  SAFETY_FIRST = 'volleyball-parking-safety-first'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/VolleyballParking/MapServer';

export const VolleyballParkingDefinitions = {
  VISITOR_KIOSK: {
    id: VOLLEYBALL_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: VOLLEYBALL_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: VOLLEYBALL_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
    layerId: VOLLEYBALL_PARKING_LAYERS.PARKING_LOTS,
    name: 'Volleyball Event Parking Lots',
    url: `${eventUrl}/2`
  },
  SAFETY_FIRST: {
    id: VOLLEYBALL_PARKING_LAYERS.SAFETY_FIRST,
    layerId: VOLLEYBALL_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/3`
  }
};

export const VolleyballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.VISITOR_KIOSK.id,
    title: VolleyballParkingDefinitions.VISITOR_KIOSK.name,
    url: VolleyballParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: VolleyballParkingDefinitions.ACCESSIBLE_PARKING.url,
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
    id: VolleyballParkingDefinitions.PARKING.id,
    title: VolleyballParkingDefinitions.PARKING.name,
    url: VolleyballParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.VolelyballN',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: VolleyballParkingDefinitions.SAFETY_FIRST.id,
    title: VolleyballParkingDefinitions.SAFETY_FIRST.name,
    url: VolleyballParkingDefinitions.SAFETY_FIRST.url,
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

export const VolleyballParkingConfiguration: EventConfiguration = {
  id: 'volleyball-parking',
  name: 'Volleyball Parking',
  applicationName: 'Volleyball Parking Map',
  shortApplicationName: 'Volleyball Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M volleyball events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const VolleyballParkingOptions: SpecialEventOptions = [];

export const VolleyballParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: VolleyballParkingConfiguration,
  options: VolleyballParkingOptions,
  sources: VolleyballParkingColdLayerSources,
  references: VOLLEYBALL_PARKING_LAYERS,
  discover: {
    id: VolleyballParkingConfiguration.id,
    name: VolleyballParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M volleyball events.',
    source: 'internal',
    type: 'parking',
    keywords: ['volleyball', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
