import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

export enum NIGHT_WEEKEND_LAYERS {
  NIGHT_PRIVILEGES = 'Night Privileges 5:00pm - 6:00am'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/NightWeekendParking/MapServer';

export const NightWeekendDefinitions = {
  NIGHT_PRIVILEGES: {
    id: NIGHT_WEEKEND_LAYERS.NIGHT_PRIVILEGES,
    layerId: NIGHT_WEEKEND_LAYERS.NIGHT_PRIVILEGES,
    name: 'Night Privileges 5:00pm - 6:00am',
    url: `${eventUrl}/0`
  }
};

export const NightWeekendColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: NightWeekendDefinitions.NIGHT_PRIVILEGES.id,
    title: NightWeekendDefinitions.NIGHT_PRIVILEGES.name,
    url: NightWeekendDefinitions.NIGHT_PRIVILEGES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
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
      outFields: ['*']
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
  zoom: 16
};

export const NightWeekendOptions: SpecialEventOptions = [];

export const NightWeekendTs: ISpecialEventRoot = {
  configuration: NightWeekendConfiguration,
  options: NightWeekendOptions,
  sources: NightWeekendColdLayerSources,
  references: NIGHT_WEEKEND_LAYERS,
  discover: {
    id: NightWeekendConfiguration.id,
    name: NightWeekendConfiguration.name,
    description: 'Parking lot information for Night Privileges (5:00pm - 6:00am) and weekend parking.',
    source: 'internal',
    type: 'event',
    keywords: ['night', 'weekend', 'parking', 'permit']
  }
};
