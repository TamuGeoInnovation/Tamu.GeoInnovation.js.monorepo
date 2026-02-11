import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum SERVICE_LOADING_LAYERS {
  SERVICE_SPACES = 'service-parking-spaces',
  SERVICE_LOTS = 'service-parking-lots'
}
const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/Loading_Zones/MapServer';

export const ServiceLoadingDefinitions = {
  SERVICE_SPACES: {
    id: SERVICE_LOADING_LAYERS.SERVICE_SPACES,
    layerId: SERVICE_LOADING_LAYERS.SERVICE_SPACES,
    name: 'Service Parking Spaces',
    url: `${eventUrl}/0`
  },
  SERVICE_LOTS: {
    id: SERVICE_LOADING_LAYERS.SERVICE_LOTS,
    layerId: SERVICE_LOADING_LAYERS.SERVICE_LOTS,
    name: 'Service Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const ServiceLoadingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.SERVICE_SPACES.id,
    title: ServiceLoadingDefinitions.SERVICE_SPACES.name,
    url: ServiceLoadingDefinitions.SERVICE_SPACES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.LotName}',
      description: {
        field: 'Spc_Type',
        collapsed: true
      },
      spaceId: {
        field: 'Spc_ID_Num',
        collapsed: true
      },
      rns: {
        field: 'RNS_Num',
        collapsed: true
      },
      garageLevel: {
        field: 'Garage_Lvl',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: ServiceLoadingDefinitions.SERVICE_LOTS.id,
    title: ServiceLoadingDefinitions.SERVICE_LOTS.name,
    url: ServiceLoadingDefinitions.SERVICE_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        field: 'GIS.TS.Lot_Notes.ServiceN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const ServiceLoadingConfiguration: EventConfiguration = {
  id: 'service-loading',
  name: 'Service and Loading Zone Parking',
  applicationName: 'Service and Loading Zone Parking Map',
  shortApplicationName: 'Service & Loading',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const ServiceLoadingOptions: SpecialEventOptions = [];

export const ServiceLoadingTs: ISpecialEventRoot = {
  configuration: ServiceLoadingConfiguration,
  options: ServiceLoadingOptions,
  sources: ServiceLoadingColdLayerSources,
  references: SERVICE_LOADING_LAYERS,
  discover: {
    id: ServiceLoadingConfiguration.id,
    name: ServiceLoadingConfiguration.name,
    description: 'Service and loading zone parking layers.',
    source: 'internal',
    type: 'event',
    keywords: ['service', 'loading', 'loading zone', 'parking']
  }
};
