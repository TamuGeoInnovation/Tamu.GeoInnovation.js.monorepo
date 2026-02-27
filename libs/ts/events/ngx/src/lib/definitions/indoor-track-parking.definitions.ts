import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum INDOOR_TRACK_PARKING_LAYERS {
  VISITOR_KIOSK = 'indoor-track-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'indoor-track-parking-accessible-parking',
  PARKING_LOTS = 'indoor-track-parking-lots',
  BUILDING = 'indoor-track-parking-building',
  SAFETY_FIRST = 'indoor-track-parking-safety-first',
  TEAM_BUS_PARKING = 'indoor-track-parking-team-bus'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/IndoorTrackParking/MapServer';

export const IndoorTrackParkingDefinitions = {
  VISITOR_KIOSK: {
    id: INDOOR_TRACK_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: INDOOR_TRACK_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  ACCESSIBLE_PARKING: {
    id: INDOOR_TRACK_PARKING_LAYERS.ACCESSIBLE_PARKING,
    layerId: INDOOR_TRACK_PARKING_LAYERS.ACCESSIBLE_PARKING,
    name: 'Accessible Parking Spaces',
    url: `${eventUrl}/1`
  },
  PARKING: {
    id: INDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    layerId: INDOOR_TRACK_PARKING_LAYERS.PARKING_LOTS,
    name: 'Indoor Track Event Parking Lots',
    url: `${eventUrl}/2`
  },
  BUILDING: {
    id: INDOOR_TRACK_PARKING_LAYERS.BUILDING,
    layerId: INDOOR_TRACK_PARKING_LAYERS.BUILDING,
    name: 'Indoor Track Building',
    url: `${eventUrl}/3`
  },
  SAFETY_FIRST: {
    id: INDOOR_TRACK_PARKING_LAYERS.SAFETY_FIRST,
    layerId: INDOOR_TRACK_PARKING_LAYERS.SAFETY_FIRST,
    name: 'Safety First',
    url: `${eventUrl}/4`
  },
  TEAM_BUS_PARKING: {
    id: INDOOR_TRACK_PARKING_LAYERS.TEAM_BUS_PARKING,
    layerId: INDOOR_TRACK_PARKING_LAYERS.TEAM_BUS_PARKING,
    name: 'Team Bus Parking',
    url: `${eventUrl}/5`
  }
};

export const IndoorTrackParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.VISITOR_KIOSK.id,
    title: IndoorTrackParkingDefinitions.VISITOR_KIOSK.name,
    url: IndoorTrackParkingDefinitions.VISITOR_KIOSK.url,
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
    id: IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: IndoorTrackParkingDefinitions.ACCESSIBLE_PARKING.url,
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
    id: IndoorTrackParkingDefinitions.PARKING.id,
    title: IndoorTrackParkingDefinitions.PARKING.name,
    url: IndoorTrackParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      /**
       * Notes requested from column: IndoorN
       */
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.IndoorN',
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
    id: IndoorTrackParkingDefinitions.BUILDING.id,
    title: IndoorTrackParkingDefinitions.BUILDING.name,
    url: IndoorTrackParkingDefinitions.BUILDING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.BldgCode}',
      description: '{attributes.Abbrev}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.SAFETY_FIRST.id,
    title: IndoorTrackParkingDefinitions.SAFETY_FIRST.name,
    url: IndoorTrackParkingDefinitions.SAFETY_FIRST.url,
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
  },
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.id,
    title: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.name,
    url: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description: '{attributes.SP_SH_Notes}'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const IndoorTrackParkingConfiguration: EventConfiguration = {
  id: 'indoor-track-parking',
  name: 'Indoor Track Parking',
  applicationName: 'Indoor Track Parking Map',
  shortApplicationName: 'Indoor Track Parking Map',
  introductionText: 'Parking and transportation information for Texas A&M indoor track events.',
  eventDates: [],
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const IndoorTrackParkingOptions: SpecialEventOptions = [];

export const IndoorTrackParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: IndoorTrackParkingConfiguration,
  options: IndoorTrackParkingOptions,
  sources: IndoorTrackParkingColdLayerSources,
  references: INDOOR_TRACK_PARKING_LAYERS,
  discover: {
    id: IndoorTrackParkingConfiguration.id,
    name: IndoorTrackParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M indoor track events.',
    source: 'internal',
    type: 'parking',
    keywords: ['indoor track', 'parking', 'visitor', 'accessible', 'crosswalk', 'team bus']
  }
};
