import { LayerSource } from '@tamu-gisc/common/types';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum STUDENT_SELECTABLE_LAYERS {
  CONSTRUCTION = 'Construction',
  LINE_PAINT = 'Line Paint',
  STUDENT_SELECTABLE = 'Student Selectable Parking Lots',
  RNS_SPACES = 'RNS Spaces'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/PermitSelect/MapServer';

export const StudentSelectableDefinitions = {
  CONSTRUCTION: {
    id: STUDENT_SELECTABLE_LAYERS.CONSTRUCTION,
    layerId: STUDENT_SELECTABLE_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  LINE_PAINT: {
    id: STUDENT_SELECTABLE_LAYERS.LINE_PAINT,
    layerId: STUDENT_SELECTABLE_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/1`
  },
  STUDENT_SELECTABLE: {
    id: STUDENT_SELECTABLE_LAYERS.STUDENT_SELECTABLE,
    layerId: STUDENT_SELECTABLE_LAYERS.STUDENT_SELECTABLE,
    name: 'Student Selectable Parking Lots',
    url: `${eventUrl}/2`
  },
  RNS_SPACES: {
    id: STUDENT_SELECTABLE_LAYERS.RNS_SPACES,
    layerId: STUDENT_SELECTABLE_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/5`
  }
};

export const StudentSelectableColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: StudentSelectableDefinitions.CONSTRUCTION.id,
    title: StudentSelectableDefinitions.CONSTRUCTION.name,
    url: StudentSelectableDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: StudentSelectableDefinitions.LINE_PAINT.id,
    title: StudentSelectableDefinitions.LINE_PAINT.name,
    url: StudentSelectableDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: StudentSelectableDefinitions.STUDENT_SELECTABLE.id,
    title: StudentSelectableDefinitions.STUDENT_SELECTABLE.name,
    url: StudentSelectableDefinitions.STUDENT_SELECTABLE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: StudentSelectableDefinitions.RNS_SPACES.id,
    title: StudentSelectableDefinitions.RNS_SPACES.name,
    url: StudentSelectableDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'show',
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
    type: 'general',
    keywords: ['permit select', 'student', 'selectable', 'parking', 'rns']
  }
};
