import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum FRESHMAN_SELECTABLE_LAYERS {
  RESIDENT_STUDENT_PRIORITY = 'Resident Student Priority',
  FRESHMAN_STUDENT_SELECTABLE = 'Freshman Student Selectable'
}
const eventUrl = Connections.freshmanParkingUrl;

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

const residentStudentPriorityRenderer: FeatureRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [255, 0, 0, 255],
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 0],
      width: 0
    }
  }
};

const freshmanSelectableRenderer: FeatureRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [0, 92, 230, 255],
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 0],
      width: 0
    }
  }
};

export const FreshmanSelectableDefinitions = {
  RESIDENT_STUDENT_PRIORITY: {
    id: FRESHMAN_SELECTABLE_LAYERS.RESIDENT_STUDENT_PRIORITY,
    layerId: FRESHMAN_SELECTABLE_LAYERS.RESIDENT_STUDENT_PRIORITY,
    name: 'Resident Student Priority',
    url: `${eventUrl}/0`
  },
  FRESHMAN_STUDENT_SELECTABLE: {
    id: FRESHMAN_SELECTABLE_LAYERS.FRESHMAN_STUDENT_SELECTABLE,
    layerId: FRESHMAN_SELECTABLE_LAYERS.FRESHMAN_STUDENT_SELECTABLE,
    name: 'Freshman Student Selectable',
    url: `${eventUrl}/0`
  }
};

export const FreshmanSelectableColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FreshmanSelectableDefinitions.RESIDENT_STUDENT_PRIORITY.id,
    title: FreshmanSelectableDefinitions.RESIDENT_STUDENT_PRIORITY.name,
    url: FreshmanSelectableDefinitions.RESIDENT_STUDENT_PRIORITY.url,
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
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Resident_Lot" = 1 AND "GIS.TS.Lot_Use.FreshmanSele_Lot" = 1`,
      renderer: residentStudentPriorityRenderer
    }
  },
  {
    type: 'feature',
    id: FreshmanSelectableDefinitions.FRESHMAN_STUDENT_SELECTABLE.id,
    title: FreshmanSelectableDefinitions.FRESHMAN_STUDENT_SELECTABLE.name,
    url: FreshmanSelectableDefinitions.FRESHMAN_STUDENT_SELECTABLE.url,
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
      outFields: ['*'],
      definitionExpression: `"GIS.TS.Lot_Use.Resident_Lot" = 0 AND "GIS.TS.Lot_Use.FreshmanSele_Lot" = 1`,
      renderer: freshmanSelectableRenderer
    }
  }
];

export const FreshmanSelectableConfiguration: EventConfiguration = {
  id: 'permit-select-freshman',
  name: 'Freshman Selectable Parking',
  applicationName: 'Freshman Selectable Parking Map',
  shortApplicationName: 'Freshman Selectable Map',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const FreshmanSelectableOptions: SpecialEventOptions = [];

export const FreshmanSelectableTs: AggiemapCustomMapConfiguration = {
  configuration: FreshmanSelectableConfiguration,
  options: FreshmanSelectableOptions,
  sources: FreshmanSelectableColdLayerSources,
  references: FRESHMAN_SELECTABLE_LAYERS,
  type: 'general-map',
  discover: {
    id: FreshmanSelectableConfiguration.id,
    name: FreshmanSelectableConfiguration.name,
    description: 'Selectable parking information for freshmen.',
    source: 'internal',
    type: 'parking',
    keywords: ['permit select', 'freshman', 'selectable', 'parking', 'resident', 'priority']
  }
};
