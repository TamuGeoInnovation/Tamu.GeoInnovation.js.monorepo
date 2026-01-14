import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum FRESHMAN_SELECTABLE_LAYERS {
  CONSTRUCTION = 'Construction',
  LINE_PAINT = 'Line Paint',
  FRESHMAN_SELECTABLE = 'Freshman Selectable Parking Lots',
  RNS_SPACES = 'RNS Spaces',
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/PermitSelect/MapServer';

export const FreshmanSelectableDefinitions = {
  CONSTRUCTION: {
    id: FRESHMAN_SELECTABLE_LAYERS.CONSTRUCTION,
    layerId: FRESHMAN_SELECTABLE_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  LINE_PAINT: {
    id: FRESHMAN_SELECTABLE_LAYERS.LINE_PAINT,
    layerId: FRESHMAN_SELECTABLE_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/1`
  },
  FRESHMAN_SELECTABLE: {
    id: FRESHMAN_SELECTABLE_LAYERS.FRESHMAN_SELECTABLE,
    layerId: FRESHMAN_SELECTABLE_LAYERS.FRESHMAN_SELECTABLE,
    name: 'Freshman Selectable Parking Lots',
    url: `${eventUrl}/3`
  },
  RNS_SPACES: {
    id: FRESHMAN_SELECTABLE_LAYERS.RNS_SPACES,
    layerId: FRESHMAN_SELECTABLE_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/5`
  }
};

export const FreshmanSelectableColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: FreshmanSelectableDefinitions.CONSTRUCTION.id,
    title: FreshmanSelectableDefinitions.CONSTRUCTION.name,
    url: FreshmanSelectableDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FreshmanSelectableDefinitions.LINE_PAINT.id,
    title: FreshmanSelectableDefinitions.LINE_PAINT.name,
    url: FreshmanSelectableDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FreshmanSelectableDefinitions.FRESHMAN_SELECTABLE.id,
    title: FreshmanSelectableDefinitions.FRESHMAN_SELECTABLE.name,
    url: FreshmanSelectableDefinitions.FRESHMAN_SELECTABLE.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: FreshmanSelectableDefinitions.RNS_SPACES.id,
    title: FreshmanSelectableDefinitions.RNS_SPACES.name,
    url: FreshmanSelectableDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
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

export const FreshmanSelectableTs: ISpecialEventRoot = {
  configuration: FreshmanSelectableConfiguration,
  options: FreshmanSelectableOptions,
  sources: FreshmanSelectableColdLayerSources,
  references: FRESHMAN_SELECTABLE_LAYERS,
  discover: {
    id: FreshmanSelectableConfiguration.id,
    name: FreshmanSelectableConfiguration.name,
    description: 'Selectable parking information for freshmen.',
    source: 'internal',
    type: 'event',
    keywords: ['permit select', 'freshman', 'selectable', 'parking', 'rns']
  }
};
