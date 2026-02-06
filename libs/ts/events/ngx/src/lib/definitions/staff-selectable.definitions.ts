import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum STAFF_SELECTABLE_LAYERS {
  CONSTRUCTION = 'Construction',
  LINE_PAINT = 'Line Paint',
  STAFF_SELECTABLE = 'Staff Selectable Parking Lots',
  RNS_SPACES = 'RNS Spaces'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/PermitSelect/MapServer';

export const StaffSelectableDefinitions = {
  CONSTRUCTION: {
    id: STAFF_SELECTABLE_LAYERS.CONSTRUCTION,
    layerId: STAFF_SELECTABLE_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  LINE_PAINT: {
    id: STAFF_SELECTABLE_LAYERS.LINE_PAINT,
    layerId: STAFF_SELECTABLE_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/1`
  },
  STAFF_SELECTABLE: {
    id: STAFF_SELECTABLE_LAYERS.STAFF_SELECTABLE,
    layerId: STAFF_SELECTABLE_LAYERS.STAFF_SELECTABLE,
    name: 'Staff Selectable Parking Lots',
    url: `${eventUrl}/4`
  },
  RNS_SPACES: {
    id: STAFF_SELECTABLE_LAYERS.RNS_SPACES,
    layerId: STAFF_SELECTABLE_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/5`
  }
};

export const StaffSelectableColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: StaffSelectableDefinitions.CONSTRUCTION.id,
    title: StaffSelectableDefinitions.CONSTRUCTION.name,
    url: StaffSelectableDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: StaffSelectableDefinitions.LINE_PAINT.id,
    title: StaffSelectableDefinitions.LINE_PAINT.name,
    url: StaffSelectableDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: StaffSelectableDefinitions.STAFF_SELECTABLE.id,
    title: StaffSelectableDefinitions.STAFF_SELECTABLE.name,
    url: StaffSelectableDefinitions.STAFF_SELECTABLE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      definitionExpression: 'GIS.TS.Lot_Use.StaffSele_Lot = 1',
      renderer: {
        type: 'simple',
        label: 'Staff Selectable Lots',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [255, 255, 0, 255],
          outline: {
            type: 'simple-line',
            style: 'solid',
            color: [0, 0, 0, 0],
            width: 0
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: StaffSelectableDefinitions.RNS_SPACES.id,
    title: StaffSelectableDefinitions.RNS_SPACES.name,
    url: StaffSelectableDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'show',
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

export const StaffSelectableTs: ISpecialEventRoot = {
  configuration: StaffSelectableConfiguration,
  options: StaffSelectableOptions,
  sources: StaffSelectableColdLayerSources,
  references: STAFF_SELECTABLE_LAYERS,
  discover: {
    id: StaffSelectableConfiguration.id,
    name: StaffSelectableConfiguration.name,
    description: 'Selectable parking information for staff.',
    source: 'internal',
    type: 'event',
    keywords: ['permit select', 'staff', 'selectable', 'parking', 'rns']
  }
};
