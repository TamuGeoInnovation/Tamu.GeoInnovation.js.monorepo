import { LayerSource } from '@tamu-gisc/common/types';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';
import { MarkdownPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import esri = __esri;

export enum NSC_PARKING_LAYERS {
  NSC_PARKING_DRAW = 'nsc-parking-lots-draw',
  NSC_PARKING_LOTS = 'NSC Parking Lots'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/NewStudentConferenceParking/MapServer';

export const NscParkingDefinitions = {
  NSC_PARKING_LOTS: {
    id: NSC_PARKING_LAYERS.NSC_PARKING_LOTS,
    layerId: NSC_PARKING_LAYERS.NSC_PARKING_LOTS,
    name: 'NSC Parking Lots',
    url: `${eventUrl}/0`
  }
};

export const NscParkingColdLayerSources: LayerSource[] = [
  {
    type: 'map-image',
    id: NSC_PARKING_LAYERS.NSC_PARKING_DRAW,
    title: 'NSC Parking Lots',
    url: eventUrl,
    visible: true,
    listMode: 'hide',
    native: {
      sublayers: [
        {
          id: 0,
          title: 'NSC Parking Lots',
          visible: true,
          popupEnabled: false
        } as unknown as esri.SublayerProperties
      ]
    } as unknown as esri.MapImageLayerProperties
  },
  {
    type: 'feature',
    id: NscParkingDefinitions.NSC_PARKING_LOTS.id,
    title: NscParkingDefinitions.NSC_PARKING_LOTS.name,
    url: NscParkingDefinitions.NSC_PARKING_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      notes: {
        field: 'GIS.TS.Lot_Notes.NewStudentConfN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const NscParkingConfiguration: EventConfiguration = {
  id: 'nsc-parking',
  name: 'New Student Conference Parking',
  applicationName: 'New Student Conference Parking Map',
  shortApplicationName: 'NSC Parking Map',
  introductionText: 'Parking map for New Student Conference (NSC) permits.',
  mapCenter: [-96.34731, 30.60543],
  eventDates: [],
  zoom: 16
};

export const NscParkingOptions: SpecialEventOptions = [];

export const NscParkingTs: ISpecialEventRoot = {
  configuration: NscParkingConfiguration,
  options: NscParkingOptions,
  sources: NscParkingColdLayerSources,
  references: NSC_PARKING_LAYERS,
  type: 'special-event',
  discover: {
    id: NscParkingConfiguration.id,
    name: NscParkingConfiguration.name,
    description: 'Parking lot information for New Student Conference (NSC) permits.',
    source: 'internal',
    type: 'event',
    keywords: ['nsc', 'new student conference', 'parking', 'permit']
  }
};
