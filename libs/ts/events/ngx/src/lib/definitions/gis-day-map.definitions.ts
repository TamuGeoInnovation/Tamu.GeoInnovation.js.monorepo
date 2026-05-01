import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum GIS_DAY_LAYERS {
  MSC_RUDDER = 'gis-day-msc-rudder',
  GARAGES = 'gis-day-garages',
  CSG = 'gis-day-csg'
}

const { gisDayUrl } = Connections;
const GARAGES_URL = `${gisDayUrl}/0`;
const CSG_URL = `${gisDayUrl}/1`;
const MSC_RUDDER_URL = `${gisDayUrl}/2`;

export const GisDayLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: GIS_DAY_LAYERS.MSC_RUDDER,
    title: 'MSC & Rudder Buildings',
    url: MSC_RUDDER_URL,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.BldgName',
      description: 'attributes.EventInfo'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GIS_DAY_LAYERS.GARAGES,
    title: 'GIS Day Parking Garages',
    url: GARAGES_URL,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.BldgName',
      description: 'attributes.ParkingInfo'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: GIS_DAY_LAYERS.CSG,
    title: 'Gene Stallings Parking Garage',
    url: CSG_URL,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.LotName',
      description: 'attributes.Description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const GisDayConfiguration: EventConfiguration = {
  id: 'gis-day',
  name: 'GIS Day',
  applicationName: 'GIS Day Event Map',
  shortApplicationName: 'GIS Day',
  introductionText: 'Building and parking locations for GIS Day.',
  eventDates: ['2025-11-17', '2025-11-18', '2025-11-19', '2025-11-20', '2025-11-21'],
  mapCenter: [-96.3379, 30.61286],
  zoom: 16
};

export const GisDayOptions: SpecialEventOptions = [];

export const GisDayTs: AggiemapCustomMapConfiguration = {
  configuration: GisDayConfiguration,
  options: GisDayOptions,
  sources: GisDayLayerSources,
  references: GIS_DAY_LAYERS,
  type: 'special-event',
  discover: {
    id: GisDayConfiguration.id,
    name: GisDayConfiguration.name,
    description: 'Building and parking location information for GIS Day.',
    source: 'internal',
    type: 'event',
    keywords: ['gis', 'msc', 'rudder', 'parking']
  }
};
