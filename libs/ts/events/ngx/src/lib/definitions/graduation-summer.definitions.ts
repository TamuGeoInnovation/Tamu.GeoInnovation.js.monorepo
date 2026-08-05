import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

import esri = __esri;

export enum SUMMER_COMMENCEMENT_LAYERS {
  // Enum order drives draw order (first = top). Recommended Route above Parking Lots so its arrows show.
  TRAFFIC_FLOW = 'summer-commencement-traffic-flow',
  PARKING_LOTS = 'summer-commencement-parking-lots'
}

const eventUrl = Connections.summerCommencementUrl;

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
  name: 'Summer Commencement Ceremony',
  applicationName: 'Summer Commencement Transportation Map',
  shortApplicationName: 'Summer Commencement Map',
  introductionText: 'Get the best transportation and parking information for the summer commencement ceremonies.',
  eventDates: ['2026-08-08'],
  scheduleUrl: 'https://aggie.tamu.edu/graduation',
  mapCenter: [-96.34458, 30.60629],
  zoom: 17
};

enum SummerCommencementAttendanceDateChoices {
  DayOne = '2026-08-08T05:00:00.000Z' // August 8, 12AM UTC
}

export const SummerCommencementOptions: SpecialEventOptions = [
  {
    value: 'date',
    description:
      'Please select the day of your commencement ceremony to provide the most accurate transportation and parking information.',
    shortDescription: 'Event Day',
    label: 'Event Day',
    uiType: 'date-card-grid',
    choices: [{ value: SummerCommencementAttendanceDateChoices.DayOne, label: 'August 8, 2026' }],
    effects: {
      layers: [
        {
          layerId: SUMMER_COMMENCEMENT_LAYERS.PARKING_LOTS,
          conversions: [{ input: SummerCommencementAttendanceDateChoices.DayOne, propOverrides: { visible: true } }]
        },
        {
          layerId: SUMMER_COMMENCEMENT_LAYERS.TRAFFIC_FLOW,
          conversions: [{ input: SummerCommencementAttendanceDateChoices.DayOne, propOverrides: { visible: true } }]
        }
      ]
    }
  }
];

export const SummerCommencementTs: AggiemapCustomMapConfiguration = {
  type: 'special-event',
  configuration: SummerCommencementConfiguration,
  options: SummerCommencementOptions,
  sources: SummerCommencementColdLayerSources,
  references: SUMMER_COMMENCEMENT_LAYERS,
  discover: {
    id: SummerCommencementConfiguration.id,
    name: SummerCommencementConfiguration.name,
    description: 'Transportation and parking information for summer graduation ceremonies.',
    source: 'internal',
    type: 'event',
    columnKey: 'summer',
    keywords: ['summer', 'commencement', 'graduation', 'parking', 'transportation']
  }
};
