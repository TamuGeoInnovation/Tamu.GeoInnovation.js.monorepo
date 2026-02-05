import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SUMMER_COMMENCEMENT_LAYERS {
  PARKING_LOTS = 'summer-commencement-parking-lots',
  TRAFFIC_FLOW = 'summer-commencement-traffic-flow'
}

const eventUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/Summer_Commencement/MapServer';

const SummerCommencementEventDefinitions = {
  TRAFFIC_FLOW: {
    id: SUMMER_COMMENCEMENT_LAYERS.TRAFFIC_FLOW,
    layerId: SUMMER_COMMENCEMENT_LAYERS.TRAFFIC_FLOW,
    name: 'Recommended Route',
    url: `${eventUrl}/0`
  },
  PARKING_LOTS: {
    id: SUMMER_COMMENCEMENT_LAYERS.PARKING_LOTS,
    layerId: SUMMER_COMMENCEMENT_LAYERS.PARKING_LOTS,
    name: 'Parking Lots',
    url: `${eventUrl}/1`
  }
};

export const SummerCommencementColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: SummerCommencementEventDefinitions.TRAFFIC_FLOW.id,
    title: SummerCommencementEventDefinitions.TRAFFIC_FLOW.name,
    url: SummerCommencementEventDefinitions.TRAFFIC_FLOW.url,
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'name',
        uniqueValueInfos: [
          {
            value: 'Fast Route',
            label: 'Recommended Routes',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 3,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Slow Route',
            label: 'Expect Delays',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2,
              marker: {
                style: 'arrow',
                color: 'rgb(230, 0, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          }
        ]
      }
    }
  },
  {
    type: 'feature',
    id: SummerCommencementEventDefinitions.PARKING_LOTS.id,
    title: SummerCommencementEventDefinitions.PARKING_LOTS.name,
    url: SummerCommencementEventDefinitions.PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'attributes.name',
      description: 'attributes.description'
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      labelingInfo: [
        {
          labelExpressionInfo: {
            expression: '$feature["name"]'
          },
          maxScale: 0,
          minScale: 0,
          useCodedValues: true,
          symbol: {
            type: 'text',
            color: 'black',
            haloColor: 'white',
            haloSize: 1,
            angle: 0,
            font: {
              family: 'Arial Unicode MS',
              size: 10,
              weight: 'bold'
            }
          }
        }
      ]
    }
  }
];

export const SummerCommencementConfiguration: EventConfiguration = {
  id: 'graduation-summer',
  name: 'Commencement Ceremony',
  applicationName: 'Commencement Transportation Map',
  shortApplicationName: 'Commencement Map',
  introductionText: 'Get the best transportation and parking information for the summer commencement ceremonies.',
  eventDates: ['2025-08-09'],
  mapCenter: [-96.34458, 30.60629],
  zoom: 17
};

enum SummerCommencementAttendanceDateChoices {
  DayOne = '2025-08-09T05:00:00.000Z' // May 8, 12AM UTC
}

export const SummerCommencementOptions: SpecialEventOptions = [];

export const SummerCommencementTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: SummerCommencementConfiguration,
  options: SummerCommencementOptions,
  sources: SummerCommencementColdLayerSources,
  references: SUMMER_COMMENCEMENT_LAYERS,
  discover: {
    id: SummerCommencementConfiguration.id,
    name: SummerCommencementConfiguration.name,
    description: 'Transportation and parking information for summer commencement ceremony.',
    source: 'internal',
    type: 'event',
    keywords: ['summer', 'commencement', 'graduation', 'parking', 'transportation']
  }
};
