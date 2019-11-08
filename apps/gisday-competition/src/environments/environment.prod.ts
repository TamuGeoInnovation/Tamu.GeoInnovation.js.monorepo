export const environment = {
  production: true
};

import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/search';

import { Connections, Definitions as d, Protocol, HostName } from './definitions';

export * from './definitions';

export const LeaderboardUrl = `${Protocol}/${HostName}/Rest/Leaderboard/Get/`;
export const SubmissionsUrl = `${Protocol}/${HostName}/Rest/Signage/Get/Submissions/?&geoJSON=true`;
export const SubmissionsPostUrl = `${Protocol}/${HostName}/Rest/Signage/Push/Submissions/`;

export const AuthLoginUrl = `${Protocol}/${HostName}/Login?ret=${Protocol}/${HostName}/Login`;

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negatgitive impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const LocalStoreSettings = {
  subKey: 'gisday-app'
};

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
          size: 10,
          color: '#ffc5c5'
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
