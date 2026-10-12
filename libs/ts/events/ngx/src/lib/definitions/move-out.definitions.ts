import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum MOVE_OUT_LAYERS {
  NO_PARKING = 'No Parking Areas',
  STREET_PARKING = 'Move-Out Allowed Street Parking',
  MOVE_OUT_LOTS = 'Move-Out Lots'
}

const eventUrl = Connections.moveOutParkingUrl;

export const MoveOutDefinitions = {
  NO_PARKING: {
    id: MOVE_OUT_LAYERS.NO_PARKING,
    layerId: MOVE_OUT_LAYERS.NO_PARKING,
    name: 'No Parking Areas',
    url: `${eventUrl}/0`
  },
  STREET_PARKING: {
    id: MOVE_OUT_LAYERS.STREET_PARKING,
    layerId: MOVE_OUT_LAYERS.STREET_PARKING,
    name: 'Move-Out Allowed Street Parking',
    url: `${eventUrl}/1`
  },
  MOVE_OUT_LOTS: {
    id: MOVE_OUT_LAYERS.MOVE_OUT_LOTS,
    layerId: MOVE_OUT_LAYERS.MOVE_OUT_LOTS,
    name: 'Move-Out Lots',
    url: `${eventUrl}/2`
  }
};

export const MoveOutColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MoveOutDefinitions.NO_PARKING.id,
    url: MoveOutDefinitions.NO_PARKING.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'Type',
        collapsed: true
      },
      description: {
        field: 'Note',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveOutDefinitions.STREET_PARKING.id,
    url: MoveOutDefinitions.STREET_PARKING.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'A_Name',
        collapsed: true
      },
      description: {
        field: 'SP_SH_Notes',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MoveOutDefinitions.MOVE_OUT_LOTS.id,
    url: MoveOutDefinitions.MOVE_OUT_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.LotName',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.SpEv_Lot_Notes.MoveOutN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
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

export const MoveOut: AggiemapCustomMapConfiguration = {
  type: 'general-map',
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
    columnKey: 'spring',
    // Hidden while the three dated periods below are being looked at, so the campus events page
    // offers one entry per move-out rather than those three and an undated fourth. The route still
    // works, so nothing linked to it breaks. Delete this line to list it again (#1691).
    visible: false,
    keywords: ['move out', 'parking', 'transportation']
  }
};

/**
 * Move-out happens three times a year, on its own deadline each time, and the one map said nothing
 * about which (#1691).
 *
 * Residence Life publishes a deadline per period - spring, Summer I, Summer II - and they are
 * different enough that a visitor needs to know which one they are looking at. One map with no dates
 * could never say its event was over either, so it stayed on the campus events page for a year.
 *
 * The three share this file's layers and sources, because the parking is the same: only the name,
 * the dates and the season differ. Adding next year's is one line here, not another copy of the map.
 */
const moveOutPeriod = (
  id: string,
  name: string,
  eventDates: Array<string>,
  columnKey: string,
  description: string
): AggiemapCustomMapConfiguration => ({
  type: 'general-map',
  configuration: {
    ...MoveOutConfiguration,
    id,
    name,
    applicationName: `${name} Transportation Map`,
    shortApplicationName: `${name} Map`,
    eventDates
  },
  options: MoveOutOptions,
  sources: MoveOutColdLayerSources,
  references: MOVE_OUT_LAYERS,
  discover: {
    id,
    name,
    description,
    source: 'internal',
    type: 'event',
    columnKey,
    keywords: ['move out', 'parking', 'transportation', columnKey]
  }
});

/**
 * 2027's deadlines, matched to 2026's by weekday rather than by calendar date.
 *
 * Residence Life ties each one to the end of its term - Saturday for spring and Summer II, Tuesday
 * for Summer I - so 2026's 9 May, 30 June and 8 August become 8 May, 29 June and 7 August. Taking
 * the same calendar dates would have put two of them on a Sunday.
 *
 * Published for 2026 at https://reslife.tamu.edu/moveout/; 2027's are not published yet, so these
 * are the expected dates and want confirming before anyone relies on them.
 */
export const SpringMoveOut = moveOutPeriod(
  'spring-move-out',
  'Spring Move Out',
  ['2027-05-08'],
  'spring',
  'Transportation and parking information for move-out at the end of the spring semester.'
);

export const SummerOneMoveOut = moveOutPeriod(
  'summer-i-move-out',
  'Summer I Move Out',
  ['2027-06-29'],
  'summer',
  'Transportation and parking information for move-out at the end of Summer I.'
);

export const SummerTwoMoveOut = moveOutPeriod(
  'summer-ii-move-out',
  'Summer II Move Out',
  ['2027-08-07'],
  'summer',
  'Transportation and parking information for move-out at the end of Summer II.'
);
