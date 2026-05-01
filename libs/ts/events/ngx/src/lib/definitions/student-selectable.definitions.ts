import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum STUDENT_SELECTABLE_LAYERS {
  STUDENT_SELECTABLE = 'Student Selectable Parking Lots'
}
const eventUrl = Connections.studentParkingUrl;

export const StudentSelectableDefinitions = {
  STUDENT_SELECTABLE: {
    id: STUDENT_SELECTABLE_LAYERS.STUDENT_SELECTABLE,
    layerId: STUDENT_SELECTABLE_LAYERS.STUDENT_SELECTABLE,
    name: 'Student Selectable Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const StudentSelectableColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: StudentSelectableDefinitions.STUDENT_SELECTABLE.id,
    title: StudentSelectableDefinitions.STUDENT_SELECTABLE.name,
    url: StudentSelectableDefinitions.STUDENT_SELECTABLE.url,
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

export const StudentSelectableConfiguration: EventConfiguration = {
  id: 'permit-select-student',
  name: 'Student Selectable Parking',
  applicationName: 'Student Selectable Parking Map',
  shortApplicationName: 'Student Selectable Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const StudentSelectableOptions: SpecialEventOptions = [];

export const StudentSelectableTs: AggiemapCustomMapConfiguration = {
  configuration: StudentSelectableConfiguration,
  options: StudentSelectableOptions,
  sources: StudentSelectableColdLayerSources,
  references: STUDENT_SELECTABLE_LAYERS,
  type: 'general-map',
  discover: {
    id: StudentSelectableConfiguration.id,
    name: StudentSelectableConfiguration.name,
    description: 'Selectable parking information for students.',
    source: 'internal',
    type: 'parking',
    keywords: ['permit select', 'student', 'selectable', 'parking']
  }
};
