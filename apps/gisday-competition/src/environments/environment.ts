// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/search';

import { Connections, Definitions as d, Protocol } from './definitions';

export * from './definitions';

export const LeaderboardUrl = `${Protocol}localhost/gisday.tamu.edu/Rest/Leaderboard/Get/`;
export const SubmissionsUrl = `${Protocol}localhost/gisday.tamu.edu/Rest/Signage/Get/Submissions/?&geoJSON=true`;

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
    type: 'geojson',
    id: d.SUBMISSIONS.layerId,
    title: d.SUBMISSIONS.name,
    url: SubmissionsUrl,
    listMode: 'show',
    loadOnInit: true,
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
    }
  }
];

const commonQueryParams: any = {
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
  }
];
