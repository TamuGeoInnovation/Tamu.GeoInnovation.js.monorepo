import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

import esri = __esri;

export enum BIG_EVENT_LAYERS {
  ROAD_CLOSURES = 'big-event-road-closures',
  PARKING_LOTS = 'big-event-parking-lots',
  TRAFFIC = 'big-event-traffic'
}

export enum BIG_EVENT_MAP_TYPE_OPTIONS {
  PRE_KICKOFF = 'To Kickoff',
  LEAVE_KICKOFF = 'Leave Kickoff',
  TOOL_RETURN = 'Tool Dropoff'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/Big_Event/MapServer';

export const BigEventDefinitions = {
  TRAFFIC: {
    id: BIG_EVENT_LAYERS.TRAFFIC,
    layerId: BIG_EVENT_LAYERS.TRAFFIC,
    name: 'Traffic Flow',
    url: `${eventUrl}/0`
  },
  ROAD_CLOSURES: {
    id: BIG_EVENT_LAYERS.ROAD_CLOSURES,
    layerId: BIG_EVENT_LAYERS.ROAD_CLOSURES,
    name: 'Road Closures',
    url: `${eventUrl}/1`
  },
  PARKING_LOTS: {
    id: BIG_EVENT_LAYERS.PARKING_LOTS,
    layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
    name: 'Parking Lots',
    url: `${eventUrl}/2`
  }
};

export const BigEventColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BigEventDefinitions.TRAFFIC.id,
    title: BigEventDefinitions.TRAFFIC.name,
    url: BigEventDefinitions.TRAFFIC.url,
    popupComponent: MarkdownPopupComponent,
    // popupData: {
    //   name: 'Aggieland Saturday Bus Stop ({attributes.StopType})',
    //   description: `Stop Name: {attributes.StopName}\nRoute Number: {attributes.Route}`
    // },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'edited',
        field2: 'name',
        fieldDelimiter: ',',
        uniqueValueInfos: [
          {
            value: 'Leave Kickoff,Exit Route',
            label: 'Leave Kickoff - Exit Route',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 2.5,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Leave Kickoff,Road Closed',
            label: 'Leave Kickoff - Road Closed',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'To Kickoff,Expect Delays',
            label: 'To Kickoff - Expect Delays',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5,
              marker: {
                style: 'arrow',
                color: 'rgb(230, 0, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'To Kickoff,Fast Route ',
            label: 'To Kickoff - Fast Route',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 2.5,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'To Kickoff,Road Closed',
            label: 'To Kickoff - Road Closed',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Tool Dropoff,Expect Delays',
            label: 'Tool Dropoff - Expect Delays',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5,
              marker: {
                style: 'arrow',
                color: 'rgb(230, 0, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Tool Dropoff,Fastest Route',
            label: 'Tool Dropoff - Fastest Route',
            symbol: {
              type: 'simple-line',
              color: 'rgb(56, 168, 0)',
              width: 2.5,
              marker: {
                style: 'arrow',
                color: 'rgb(56, 168, 0)',
                placement: 'end'
              }
            } as unknown as esri.SimpleLineSymbolProperties
          },
          {
            value: 'Tool Dropoff,Road Closed',
            label: 'Tool Dropoff - Road Closed',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5
            } as unknown as esri.SimpleLineSymbolProperties
          }
        ]
      }
    }
  },
  {
    type: 'feature',
    id: BigEventDefinitions.ROAD_CLOSURES.id,
    title: BigEventDefinitions.ROAD_CLOSURES.name,
    url: BigEventDefinitions.ROAD_CLOSURES.url,
    popupComponent: MarkdownPopupComponent,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BigEventDefinitions.PARKING_LOTS.id,
    title: BigEventDefinitions.PARKING_LOTS.name,
    url: BigEventDefinitions.PARKING_LOTS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    // popupData: {
    //   name: `Aggieland Saturday Points of Interest`,
    //   description: `Type: {attributes.Type}`
    // },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];

export const BigEventConfiguration: EventConfiguration = {
  id: 'big-event',
  name: 'Big Event',
  applicationName: 'Big Event Transportation Map',
  shortApplicationName: 'Big Event Map',
  eventDates: ['2025-03-22']
};

export const BigEventOptions: SpecialEventOptions = [
  {
    value: 'map-type',
    label: 'Map Type',
    description: 'Select the type of map you would like to view.',
    shortDescription: 'Map Type',
    choices: [
      {
        label: 'Pre-Kickoff Parking',
        value: BIG_EVENT_MAP_TYPE_OPTIONS.PRE_KICKOFF
      },
      {
        label: 'Leaving Kickoff',
        value: BIG_EVENT_MAP_TYPE_OPTIONS.LEAVE_KICKOFF
      },
      {
        label: 'Tool Return',
        value: BIG_EVENT_MAP_TYPE_OPTIONS.TOOL_RETURN
      }
    ],
    effects: {
      layers: [
        {
          layerId: BIG_EVENT_LAYERS.TRAFFIC,
          field: 'edited'
        },
        {
          layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
          field: 'Type',
          conversions: [
            {
              input: BIG_EVENT_MAP_TYPE_OPTIONS.TOOL_RETURN,
              output: 'Tool Distribution'
            },
            {
              input: BIG_EVENT_MAP_TYPE_OPTIONS.LEAVE_KICKOFF,
              output: 'Tool Distribution' // Simply to not show any actual parking lots, only the return area
            }
          ]
        },
        {
          layerId: BIG_EVENT_LAYERS.ROAD_CLOSURES,
          field: 'OBJECTID',
          conversions: [
            {
              input: BIG_EVENT_MAP_TYPE_OPTIONS.PRE_KICKOFF,
              output: 81
            },
            {
              input: BIG_EVENT_MAP_TYPE_OPTIONS.TOOL_RETURN,
              output: 999 // Some bogus value that will always return no results, to hide layer when this input is selected
            }
          ]
        }
      ]
    }
  }
];

export const BigEventTs: ISpecialEventRoot = {
  configuration: BigEventConfiguration,
  options: BigEventOptions,
  sources: BigEventColdLayerSources,
  references: BIG_EVENT_LAYERS,
  discover: {
    id: BigEventConfiguration.id,
    name: BigEventConfiguration.name,
    description: 'Transportation and parking information for Big Event.',
    source: 'internal',
    type: 'event',
    keywords: ['big event', 'parking', 'transportation']
  }
};
