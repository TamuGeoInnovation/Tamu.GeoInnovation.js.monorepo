import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum INDOOR_TRACK_PARKING_LAYERS {
  VISITOR_KIOSK = 'indoor-track-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'indoor-track-parking-accessible-parking',
  PARKING_LOTS = 'indoor-track-parking-lots',
  BUILDING = 'indoor-track-parking-building',
  SAFETY_FIRST = 'indoor-track-parking-safety-first',
  TEAM_BUS_PARKING = 'indoor-track-parking-team-bus'
}

const eventUrl = Connections.indoorTrackParkingUrl;

/**
 * The hosted views expose a campus-wide symbol table and the campus-wide street striping table,
 * so every layer sourced from them has to be narrowed down to this event on the client. The view
 * also publishes the symbol layer with a plain dot renderer, so this map's art has to live on the
 * client — this is the image the legacy `TS_Events/TracSocSoftSwimVollWbask` map service drew.
 */
const ACCESSIBLE_PARKING_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACzUlEQVRIieWVe0hTURzHv1t36rRZ05WpMH' +
  'toSaRIJaloptHDQDN6kD0gpDCSYEUgSUH9EWWBSmH0sH/CkrSECBTzESLhi2yFKx8zG+ZjppPNvdzcTuwE0bQ7bltG0BcO53LO7/4+/O75/u5h' +
  '8BfF/Eew2NsrISD+HmfmWU14Lethh8UVLT+xO/J+t2oyHoTw3OUQgCwVC5uqUCz7GegMszMSg2kmpVk+7ASSBolwPGMtalpUaOka5QTcHBOSAi' +
  'IQuvyMPB7mVHQnbwvS4sNwJisGkh2lmLbauPB4bhlEozPTWW+0wmYncFcMl6D+IR0GhnVIPlWFGZt9fmEanZlWNKjWuw3iDJvQmhHg7w1PxXAJ' +
  'stkIxCIfFMmS5uwVlr/lXLFLWIjED0+vpkE1MuVwKYIDfTFltDrF8B0bHMUKE3ozaCzJRLN8BDcr3uHgtghcftCOj58nOSfnDDu5Zx20egtyCl' +
  '7B39eLrlUXpsNsmdtju86+oG51G7Z9kxTlL3thtxNoDdM4cqnOad/HawF2xkkRFR6I/anhuF7W6T7McT5jkyb6TAjwqNbpnwqxyBul+am49vAN' +
  'Dmz1EPZlTI81YWLWFyPDxNAZLLj3XIG8oxuwKnQR+oe07sEqGpQoyE2g5nD02WzlH9uIykYlPas2xSitrqCsE6FL/FhbgRVWVtuDwztWo/5WJr' +
  'Iu1qJb9d2FAf4+KJYlISZCgtjsCrr2pL6PVpe7L5qC956v+T2YwxiZedUoOZeMrseH8GFAQ50YHR6IdoUaiTnPMDphpLGVjUpIFgtRXtcLxScN' +
  'W8pfXjE/ZJqeQfaVBtpfCVHBEDB8vFeOQ9437vTO0FcDLtxtnZWHR1zDCF8dLPHryEhcsR4855vaYLbQWbpsIR2uRAhIUIBva5N8RM8O68gdvM' +
  'EvTgdfIIKn4tuNaDk9zA5zqE2mBuAYf1zMfCT9J2DfAHKADImJlJspAAAAAElFTkSuQmCC';

const accessibleParkingSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${ACCESSIBLE_PARKING_IMAGE_DATA}`,
  width: 20,
  height: 20
} as unknown as esri.SymbolProperties;

const crosswalkSymbol = {
  type: 'simple-line',
  color: [214, 170, 81, 255],
  width: 2,
  style: 'short-dash'
} as unknown as esri.SymbolProperties;

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
    layerIndex: 25,
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
    visible: true,
    listMode: 'show',
    layerIndex: 24,
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'TrackIndoor'`,
      renderer: {
        type: 'simple',
        label: 'Accessible Parking Spaces',
        symbol: accessibleParkingSymbol
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.PARKING.id,
    title: IndoorTrackParkingDefinitions.PARKING.name,
    url: IndoorTrackParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      /**
       * Notes requested from column: IndoorN
       */
      description: {
        field: 'indoorn',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 23,
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
      name: IndoorTrackParkingDefinitions.BUILDING.name,
      description: '{attributes.sp_sh_notes}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 22,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.SAFETY_FIRST.id,
    title: IndoorTrackParkingDefinitions.SAFETY_FIRST.name,
    url: IndoorTrackParkingDefinitions.SAFETY_FIRST.url,
    visible: true,
    listMode: 'show',
    layerIndex: 20,
    native: {
      outFields: ['*'],
      popupEnabled: false,
      definitionExpression: `street_use = 'X-Walk'`,
      renderer: {
        type: 'simple',
        label: 'Please use marked crosswalks. No mid-street crossing.',
        symbol: crosswalkSymbol
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.id,
    title: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.name,
    url: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: IndoorTrackParkingDefinitions.TEAM_BUS_PARKING.name,
      description: '{attributes.sp_sh_notes}'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 21,
    native: {
      outFields: ['*']
    }
  }
];

export const IndoorTrackParkingConfiguration: EventConfiguration = {
  id: 'indoor-track-parking',
  name: 'Indoor Track',
  applicationName: 'Indoor Track Parking',
  shortApplicationName: 'Indoor Track Parking',
  introductionText: 'Parking and transportation information for Texas A&M indoor track events.',
  eventDates: [],
  scheduleUrl: 'https://12thman.com/sports/track-and-field/schedule',
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
    mapType: 'athletics',
    keywords: ['indoor track', 'parking', 'visitor', 'accessible', 'crosswalk', 'team bus']
  }
};
