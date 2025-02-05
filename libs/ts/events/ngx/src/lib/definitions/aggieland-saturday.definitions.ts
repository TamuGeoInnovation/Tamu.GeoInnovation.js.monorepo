import { LayerSource } from '@tamu-gisc/common/types';

import { AGGIELAND_SATURDAY_LAYERS } from '../interfaces/aggieland-saturday.interface';
import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/AggielandSaturday/MapServer';

export const AggielandSaturdayEventDefinitions = {
  EVENT_BUS_STOPS: {
    id: AGGIELAND_SATURDAY_LAYERS.BUS_STOPS,
    layerId: AGGIELAND_SATURDAY_LAYERS.BUS_STOPS,
    name: 'Bus Stops',
    url: `${eventUrl}/0`
  },
  EVENT_BUS_ROUTES: {
    id: AGGIELAND_SATURDAY_LAYERS.BUS_ROUTES,
    layerId: AGGIELAND_SATURDAY_LAYERS.BUS_ROUTES,
    name: 'Bus Routes',
    url: `${eventUrl}/1`
  },
  EVENT_SPECIAL_POIS: {
    id: AGGIELAND_SATURDAY_LAYERS.SPECIAL_POIS,
    layerId: AGGIELAND_SATURDAY_LAYERS.SPECIAL_POIS,
    name: 'Points of Interest @ Aggieland Saturday',
    url: `${eventUrl}/2`
  },
  EVENT_PARKING: {
    id: AGGIELAND_SATURDAY_LAYERS.PARKING,
    layerId: AGGIELAND_SATURDAY_LAYERS.PARKING,
    name: 'Parking',
    url: `${eventUrl}/3`
  }
};

export const AggielandSaturdayEventColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_PARKING.id,
    title: AggielandSaturdayEventDefinitions.EVENT_PARKING.name,
    url: AggielandSaturdayEventDefinitions.EVENT_PARKING.url,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Event} Parking',
      description: `Type: {attributes.Type}\nLot Name: {attributes.name}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_BUS_STOPS.id,
    title: AggielandSaturdayEventDefinitions.EVENT_BUS_STOPS.name,
    url: AggielandSaturdayEventDefinitions.EVENT_BUS_STOPS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: 'Aggieland Saturday Bus Stop ({attributes.StopType})',
      description: `Stop Name: {attributes.StopName}\nRoute Number: {attributes.Route}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_BUS_ROUTES.id,
    title: AggielandSaturdayEventDefinitions.EVENT_BUS_ROUTES.name,
    url: AggielandSaturdayEventDefinitions.EVENT_BUS_ROUTES.url,
    visible: true,
    native: {
      listMode: 'show',
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'RouteName',
        uniqueValueInfos: [
          {
            value: 'Aggieland Saturday E',
            label: 'East Route',
            symbol: {
              type: 'simple-line',
              color: 'blue',
              width: 3.5,
              marker: {
                style: 'arrow',
                color: 'blue',
                placement: 'end'
              }
            }
          },
          {
            value: 'Aggieland Saturday W',
            label: 'West Route',
            symbol: {
              type: 'simple-line',
              color: 'red',
              width: 3.5,
              marker: {
                style: 'arrow',
                color: 'red',
                placement: 'end'
              }
            }
          }
        ]
      } as any
    }
  },
  {
    type: 'feature',
    id: AggielandSaturdayEventDefinitions.EVENT_SPECIAL_POIS.id,
    title: AggielandSaturdayEventDefinitions.EVENT_SPECIAL_POIS.name,
    url: AggielandSaturdayEventDefinitions.EVENT_SPECIAL_POIS.url,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: `Aggieland Saturday Points of Interest`,
      description: `Type: {attributes.Type}`
    },
    visible: true,
    listMode: 'show',
    native: {
      outFields: ['*']
    }
  }
];
