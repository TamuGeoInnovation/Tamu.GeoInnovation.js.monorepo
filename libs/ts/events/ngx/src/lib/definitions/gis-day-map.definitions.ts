import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';
import { EventPopups } from '../modules/popups/popups';

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
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
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
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
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
    popupComponent: EventPopups.MarkdownWDirectionsPopupComponent,
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
  eventDates: ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'],
  mapCenter: [-96.3379, 30.61286],
  zoom: 16,
  // The main map's notice through GIS Day week and the seven days before it (#2678). The dates above were
  // this year's all along; without a toast, `EventNotificationsService` skipped the event before it looked
  // at them, so the notice had never been capable of appearing. No season in the id: the service appends the
  // year of the earliest date itself (#2051), which is what brings the notice back for a new GIS Day.
  toast: {
    id: 'gis-day-notification',
    title: 'GIS Day Map Available',
    message:
      'Coming to Texas A&M GIS Day? Click me to open the GIS Day map for building and parking locations around the MSC and Rudder Tower.',
    imgUrl: './assets/images/icons/transportation/Parking.png',
    imgAltText: 'Parking Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/gis-day'
    }
  }
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
    columnKey: 'fall',
    keywords: ['gis', 'msc', 'rudder', 'parking']
  }
};
