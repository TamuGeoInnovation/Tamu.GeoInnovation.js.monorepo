import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SOCCER_PARKING_LAYERS {
  VISITOR_KIOSK = 'soccer-parking-visitor-kiosk',
  ACCESSIBLE_PARKING = 'soccer-parking-accessible-parking',
  PARKING_LOTS = 'soccer-parking-lots',
  SAFETY_FIRST = 'soccer-parking-safety-first'
}

const eventUrl = Connections.soccerParkingUrl;

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

export const SoccerParkingDefinitions = {
  VISITOR_KIOSK: {
    id: SOCCER_PARKING_LAYERS.VISITOR_KIOSK,
    layerId: SOCCER_PARKING_LAYERS.VISITOR_KIOSK,
    name: 'Purchase Hourly Visitor Parking',
    url: `${eventUrl}/0`
  },
  PARKING: {
    id: SOCCER_PARKING_LAYERS.PARKING_LOTS,
    layerId: SOCCER_PARKING_LAYERS.PARKING_LOTS,
    name: 'Soccer Event Parking Lots',
    url: `${eventUrl}/2`
  },
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
    id: SoccerParkingDefinitions.VISITOR_KIOSK.id,
    title: SoccerParkingDefinitions.VISITOR_KIOSK.name,
    url: SoccerParkingDefinitions.VISITOR_KIOSK.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'Visitor Permit Kiosk',
      description: 'Purchase your hourly parking permit here.'
    },
    visible: true,
    listMode: 'show',
    layerIndex: 12,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        label: 'Purchase Hourly Visitor Parking',
        symbol: {
          type: 'picture-marker',
          url: '/assets/images/icons/transportation/Paid-Parking.png',
          width: 22,
          height: 22
        } as unknown as esri.SymbolProperties
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoccerParkingDefinitions.ACCESSIBLE_PARKING.id,
    title: SoccerParkingDefinitions.ACCESSIBLE_PARKING.name,
    url: SoccerParkingDefinitions.ACCESSIBLE_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    listMode: 'show',
    layerIndex: 11,
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Soccer'`,
      renderer: {
        type: 'simple',
        label: 'Accessible Parking Spaces',
        symbol: accessibleParkingSymbol
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoccerParkingDefinitions.PARKING.id,
    title: SoccerParkingDefinitions.PARKING.name,
    url: SoccerParkingDefinitions.PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'soccern',
        collapsed: true
      }
    },
    visible: true,
    listMode: 'show',
    layerIndex: 10,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'soccer',
        uniqueValueInfos: [
          {
            value: 'AnyValidRec',
            label: 'Rec Center Patrons Only',
            symbol: {
              type: 'simple-fill',
              color: [27, 72, 94, 255],
              outline: null
            } as unknown as esri.SymbolProperties
          },
          {
            value: 'EventParking',
            label: 'Event Parking',
            symbol: {
              type: 'simple-fill',
              color: [123, 35, 42, 255],
              outline: null
            } as unknown as esri.SymbolProperties
          }
        ]
      }
    }
  } as unknown as LayerSource,
  {
    type: 'feature',
    id: SoccerParkingDefinitions.SAFETY_FIRST.id,
    title: SoccerParkingDefinitions.SAFETY_FIRST.name,
    url: SoccerParkingDefinitions.SAFETY_FIRST.url,
    visible: true,
    listMode: 'show',
    layerIndex: 9,
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
  } as unknown as LayerSource
];

export const SoccerParkingConfiguration: EventConfiguration = {
  id: 'soccer-parking',
  name: 'Soccer',
  applicationName: 'Soccer Parking',
  shortApplicationName: 'Soccer Parking',
  introductionText: 'Parking and transportation information for Texas A&M soccer events.',
  eventDates: [
    '2026-08-05',
    '2026-08-22',
    '2026-08-27',
    '2026-09-03',
    '2026-09-06',
    '2026-09-24',
    '2026-09-27',
    '2026-10-15',
    '2026-10-18',
    '2026-11-01'
  ],
  scheduleUrl: 'https://12thman.com/sports/womens-soccer/schedule',
  zoom: 16,
  mapCenter: [-96.34454, 30.60338]
};

export const SoccerParkingOptions: SpecialEventOptions = [];

const SoccerParkingLayerReferences: Record<string, string> = {
  VISITOR_KIOSK: SOCCER_PARKING_LAYERS.VISITOR_KIOSK,
  ACCESSIBLE_PARKING: SOCCER_PARKING_LAYERS.ACCESSIBLE_PARKING,
  PARKING_LOTS: SOCCER_PARKING_LAYERS.PARKING_LOTS,
  SAFETY_FIRST: SOCCER_PARKING_LAYERS.SAFETY_FIRST
};

export const SoccerParkingTs: AggiemapCustomMapConfiguration = {
  type: 'general-map',
  configuration: SoccerParkingConfiguration,
  options: SoccerParkingOptions,
  sources: SoccerParkingColdLayerSources,
  references: SoccerParkingLayerReferences,
  discover: {
    id: SoccerParkingConfiguration.id,
    name: SoccerParkingConfiguration.name,
    description: 'Parking and transportation information for Texas A&M soccer events.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['soccer', 'parking', 'visitor', 'accessible', 'crosswalk']
  }
};
