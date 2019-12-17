// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/search';

import { Connections, Definitions as d } from './definitions';

export * from './definitions';

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: d.BUILDINGS.id,
    title: d.BUILDINGS.name,
    url: d.BUILDINGS.url,
    popupComponent: d.BUILDINGS.popupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    layerIndex: 1,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [0, 0, 0, 0.01],
          outline: {
            width: '0'
          }
        }
      }
    }
  },
  {
    type: 'geojson',
    id: d.BIKE_LOCATIONS.id,
    title: d.BIKE_LOCATIONS.name,
    url: d.BIKE_LOCATIONS.url,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          size: 8,
          color: '#03C4A6'
        }
      }
    },
    legendItems: [
      {
        id: 'visitor-parking-legend',
        title: 'VeoRide Bikes',
        src:
          'data:image/png;base64,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'
      }
    ]
  },
  {
    type: 'geojson',
    id: d.BIKE_HEATMAP.id,
    title: d.BIKE_HEATMAP.name,
    url: d.BIKE_HEATMAP.url,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      renderer: {
        type: 'heatmap',
        colorStops: [
          { ratio: 0, color: 'rgba(255, 255, 255, 0)' },
          { ratio: 0.2, color: 'rgba(255, 0, 244, 1)' },
          { ratio: 0.5, color: 'rgba(214, 2, 227, 1)' },
          { ratio: 0.8, color: 'rgba(210, 0, 210, 1)' },
          { ratio: 1, color: 'rgba(117,0,106, 1)' }
        ],
        minPixelIntensity: 0,
        maxPixelIntensity: 20,
        blurRadius: 5
      }
    }
  },
  {
    type: 'geojson',
    id: d.IDLE_HEATMAP.id,
    title: d.IDLE_HEATMAP.name,
    url: d.IDLE_HEATMAP.url,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      renderer: {
        type: 'heatmap',
        colorStops: [
          { ratio: 0, color: 'rgba(255, 255, 255, 0)' },
          { ratio: 0.2, color: 'rgba(255, 70, 0, 1)' },
          { ratio: 0.5, color: 'rgba(255, 110, 0, 1)' },
          { ratio: 0.8, color: 'rgba(255, 140, 0, 1)' },
          { ratio: 1, color: 'rgba(255, 0, 0, 1)' }
        ],
        minPixelIntensity: 0,
        maxPixelIntensity: 150,
        blurRadius: 7
      }
    }
  },
  {
    type: 'geojson',
    id: d.ORIGIN_BIKE_HEATMAP.id,
    title: d.ORIGIN_BIKE_HEATMAP.name,
    url: d.ORIGIN_BIKE_HEATMAP.url,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      renderer: {
        type: 'heatmap',
        colorStops: [
          { ratio: 0, color: 'rgba(85, 6, 6, 0)' },
          { ratio: 0.2, color: 'rgba(255,0,0, 0.2)' },
          { ratio: 0.3, color: 'rgba(191,1,1, 0.2)' },
          { ratio: 0.7, color: 'rgba(155,0,4, 0.2)' },
          { ratio: 1, color: 'rgba(130,6,6, 0.2)' }
        ],
        minPixelIntensity: 0,
        maxPixelIntensity: 40,
        blurRadius: 7
      }
    }
  },
  {
    type: 'geojson',
    id: d.DESTINATION_BIKE_HEATMAP.id,
    title: d.DESTINATION_BIKE_HEATMAP.name,
    url: d.DESTINATION_BIKE_HEATMAP.url,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      renderer: {
        type: 'heatmap',
        colorStops: [
          { ratio: 0, color: 'rgba(10, 6, 85, 0)' },
          { ratio: 0.2, color: 'rgba(0, 212, 255, 0.2)' },
          { ratio: 0.4, color: 'rgba(0, 128, 230, 0.2)' },
          { ratio: 0.7, color: 'rgba(1, 66, 198, 0.2)' },
          { ratio: 1, color: 'rgba(0, 0, 147, 0.2)' }
        ],
        minPixelIntensity: 0,
        maxPixelIntensity: 40,
        blurRadius: 7
      }
    }
  }
];

const commonQueryParams: SearchSourceQueryParamsProperties = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

export const SearchSources: SearchSource[] = [
  {
    source: 'building',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbr', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName'],
        operators: ['LIKE'],
        wildcards: ['startsWith'],
        transformations: ['UPPER']
      }
    },
    scoringKeys: ['attributes.BldgAbbr', 'attributes.Number', 'attributes.BldgName'],
    featuresLocation: 'features',
    displayTemplate: '{{attributes.BldgName}} ({{attributes.Number}})',
    popupComponent: 'BuildingPopupComponent',
    searchActive: true
  },
  {
    source: 'building-exact',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.BldgName}} ({{attributes.Number}})',
    popupComponent: 'BuildingPopupComponent',
    searchActive: false
  },
  {
    source: 'bike-racks',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 9999,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{{attributes.Type}}',
    searchActive: false
  }
];
