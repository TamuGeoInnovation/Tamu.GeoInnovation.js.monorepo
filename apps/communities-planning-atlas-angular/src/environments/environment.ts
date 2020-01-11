import { LayerSource } from '@tamu-gisc/common/types';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const SearchSources = [];

export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: 'county-boundary',
    title: 'County',
    loadOnInit: true,
    listMode: 'show',
    url: 'https://texasatlas.arch.tamu.edu/arcgis/rest/services/PubTX/TA_AdminBdys/MapServer/7',
    native: {
      minScale: 10000000,
      maxScale: 0,
      definitionExpression: 'GEOID = 48489',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: 'red',
          style: 'short-dash',
          join: 'round',
          cap: 'round',
          width: '2pt'
        }
      }
    }
  },
  {
    type: 'feature',
    id: 'floodplain',
    title: 'Floodplain',
    loadOnInit: false,
    listMode: 'show',
    url: 'https://texasatlas.arch.tamu.edu/arcgis/rest/services/PubCSA/CA30_CoastalFloodplain/MapServer',
    native: {
      // renderer: {
      //   type: 'simple',
      //   symbol: {
      //     type: 'simple-fill',
      //     color: 'blue'
      //   }
      // }
    }
  }
];
