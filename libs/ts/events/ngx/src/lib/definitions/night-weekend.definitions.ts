import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

export enum NIGHT_WEEKEND_LAYERS {
  NIGHT_PRIVILEGES = 'Night Privileges 5:00pm - 6:00am'
}

const eventUrl = Connections.nightWeekendParkingUrl;

export const NightWeekendDefinitions = {
  NIGHT_PRIVILEGES: {
    id: NIGHT_WEEKEND_LAYERS.NIGHT_PRIVILEGES,
    layerId: NIGHT_WEEKEND_LAYERS.NIGHT_PRIVILEGES,
    url: `${eventUrl}/0`
  }
};

export const NightWeekendColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: NightWeekendDefinitions.NIGHT_PRIVILEGES.id,
    url: NightWeekendDefinitions.NIGHT_PRIVILEGES.url,
    visible: true,
    listMode: 'show',
    popupComponent: EventPopups.MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.NandWN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      // labels are being buried under features so they are being manually drawn
      labelsVisible: true,
      labelingInfo: [
        {
          labelPlacement: 'always-horizontal',
          labelExpressionInfo: {
            expression: `$feature["GIS.TS.ParkingLots.Name"]`
          },
          minScale: 15000,
          maxScale: 0,
          symbol: {
            type: 'text',
            color: [0, 0, 0, 255],
            haloColor: [255, 255, 255, 255],
            haloSize: 1,
            font: {
              family: 'Open Sans',
              size: 12,
              weight: 'bold'
            }
          }
        }
      ]
    }
  }
];

export const NightWeekendConfiguration: EventConfiguration = {
  id: 'night-weekend',
  name: 'Night / Weekend',
  applicationName: 'Night / Weekend Transportation Map',
  shortApplicationName: 'Night / Weekend Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16,
  sidebarInfo: {
    sections: [
      {
        heading: 'Night Privileges',
        items: ['Monday - Thursday 5:00 p.m. - 6:00 a.m.']
      },
      {
        heading: 'Weekend Privileges',
        items: ['Friday 6:00 p.m. - Monday 6:00 a.m.']
      }
    ]
  }
};

export const NightWeekendOptions: SpecialEventOptions = [];

export const NightWeekendTs: AggiemapCustomMapConfiguration = {
  configuration: NightWeekendConfiguration,
  options: NightWeekendOptions,
  sources: NightWeekendColdLayerSources,
  references: NIGHT_WEEKEND_LAYERS,
  type: 'general-map',
  discover: {
    id: NightWeekendConfiguration.id,
    name: NightWeekendConfiguration.name,
    description: 'Parking lot information for night and weekend privileges.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'permit',
    showInQuickLinks: true,
    quickLinkOrder: 5,
    keywords: ['night', 'weekend', 'parking', 'permit']
  }
};
