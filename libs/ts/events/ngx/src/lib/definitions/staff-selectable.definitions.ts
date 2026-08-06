import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum STAFF_SELECTABLE_LAYERS {
  STAFF_SELECTABLE = 'Staff Selectable Parking Lots'
}

const eventUrl = Connections.staffParkingUrl;

export const StaffSelectableDefinitions = {
  STAFF_SELECTABLE: {
    id: STAFF_SELECTABLE_LAYERS.STAFF_SELECTABLE,
    layerId: STAFF_SELECTABLE_LAYERS.STAFF_SELECTABLE,
    name: 'Staff Selectable Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const StaffSelectableColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: StaffSelectableDefinitions.STAFF_SELECTABLE.id,
    title: StaffSelectableDefinitions.STAFF_SELECTABLE.name,
    url: StaffSelectableDefinitions.STAFF_SELECTABLE.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.StuSeleN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const StaffSelectableConfiguration: EventConfiguration = {
  id: 'permit-select-staff',
  name: 'Staff Selectable Parking',
  applicationName: 'Staff Selectable Parking Map',
  shortApplicationName: 'Staff Selectable Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const StaffSelectableOptions: SpecialEventOptions = [];

export const StaffSelectableTs: AggiemapCustomMapConfiguration = {
  configuration: StaffSelectableConfiguration,
  options: StaffSelectableOptions,
  sources: StaffSelectableColdLayerSources,
  references: STAFF_SELECTABLE_LAYERS,
  type: 'general-map',
  discover: {
    id: StaffSelectableConfiguration.id,
    name: StaffSelectableConfiguration.name,
    description: 'Selectable parking information for staff.',
    source: 'internal',
    type: 'parking',
    parkingCategory: 'permit',
    keywords: ['permit select', 'staff', 'selectable', 'parking']
  }
};
