import { LayerSource } from '@tamu-gisc/common/types';

import { BIG_EVENT_LAYERS } from '../interfaces/big-event.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';
import { SpecialEventOptions } from '../interfaces/special-event.interface';

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
    popupComponent: MarkdownWDirectionsPopupComponent,
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
            }
          },
          {
            value: 'Leave Kickoff,Road Closed',
            label: 'Leave Kickoff - Road Closed',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5
            }
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
            }
          },
          {
            value: 'To Kickoff,Fast Route',
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
            }
          },
          {
            value: 'To Kickoff,Road Closed',
            label: 'To Kickoff - Road Closed',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5
            }
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
            }
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
            }
          },
          {
            value: 'Tool Dropoff,Road Closed',
            label: 'Tool Dropoff - Road Closed',
            symbol: {
              type: 'simple-line',
              color: 'rgb(230, 0, 0)',
              width: 2.5
            }
          }
        ]
      } as any
    }
  },
  {
    type: 'feature',
    id: BigEventDefinitions.ROAD_CLOSURES.id,
    title: BigEventDefinitions.ROAD_CLOSURES.name,
    url: BigEventDefinitions.ROAD_CLOSURES.url,
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
      // renderer: {
      //   type: 'unique-value',
      //   field: 'Type',
      //   uniqueValueInfos: [
      //     {
      //       value: 'Pay Parking',
      //       label: 'Paid Parking',
      //       symbol: {
      //         type: 'picture-marker',
      //         url: '/assets/images/icons/transportation/Paid-Parking.png',
      //         width: '24px',
      //         height: '32px'
      //       }
      //     },
      //     {
      //       value: 'Dining',
      //       label: 'Dining',
      //       symbol: {
      //         type: 'picture-marker',
      //         url: '/assets/images/icons/shops-food/Dining.png',
      //         width: '24px',
      //         height: '32px'
      //       }
      //     },
      //     {
      //       value: 'Performance',
      //       label: 'Performance',
      //       symbol: {
      //         type: 'picture-marker',
      //         url: '/assets/images/icons/fixtures/Theater.png',
      //         width: '24px',
      //         height: '32px'
      //       }
      //     },
      //     {
      //       value: 'Shopping',
      //       label: 'Shopping',
      //       symbol: {
      //         type: 'picture-marker',
      //         url: '/assets/images/icons/shops-food/Store.png',
      //         width: '24px',
      //         height: '32px'
      //       }
      //     },
      //     {
      //       value: 'Bus Parking',
      //       label: 'Bus Parking',
      //       symbol: {
      //         type: 'picture-marker',
      //         url: '/assets/images/icons/hazards/Hazard.png',
      //         width: '24px',
      //         height: '32px'
      //       }
      //     }
      //   ]
      // } as any
    }
  }
];

export const BigEventOptions: Array<SpecialEventOptions> = [
  {
    value: 'map-type',
    label: 'Map Type',
    description: 'Select the type of map you would like to view.',
    options: [
      {
        label: 'Pre-Kickoff Parking',
        value: 'pre-kickoff',
        effects: {
          layers: [
            {
              layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
              definitionExpression: "Type = 'Pre-Kickoff Parking'"
            }
          ]
        }
      },
      {
        label: 'Leaving Kickoff',
        value: 'leave-kickoff',
        effects: {
          layers: [
            {
              layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
              definitionExpression: "Type = 'Leave Kickoff'"
            }
          ]
        }
      },
      {
        label: 'Tool Return',
        value: 'tool-return',
        effects: {
          layers: [
            {
              layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
              definitionExpression: "Type = 'Tool Return'"
            }
          ]
        }
      }
    ]
  },
  {
    value: 'accessible',
    label: 'Accessible Accommodations',
    description: 'Will you or a relative require accessible (ADA) accommodations?',
    options: [
      {
        label: 'No',
        value: false,
        effects: {
          layers: [
            {
              layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
              definitionExpression: "Type = 'Accessible Parking'"
            }
          ]
        }
      },
      {
        label: 'Yes',
        value: true,
        effects: {
          layers: [
            {
              layerId: BIG_EVENT_LAYERS.PARKING_LOTS,
              definitionExpression: "Type = 'Accessible Parking'"
            }
          ]
        }
      }
    ]
  }
];
