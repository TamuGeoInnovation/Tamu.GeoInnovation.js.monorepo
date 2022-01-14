export const environment = {
  production: true
};

import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';

import { Connections, Definitions as d } from './definitions';
import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export * from './definitions';

export const api_url = 'https://nodes.geoservices.tamu.edu/api/gisday';

export const AuthLoginUrl = `https://txgisday.org/Login?ret=https://txgisday.org/Login`;

export const LocalStoreSettings = {
  subKey: 'gisday-app'
};

export const NotificationEvents: NotificationProperties[] = [
  {
    id: 'no_gps',
    title: 'Location Services Disabled',
    acknowledge: false,
    message: 'Location permissions are required for this application. Please enable them in your settings.',
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Out of Bounds Icon'
  }
];

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negatgitive impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const LayerSources: LayerSource[] = [];

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
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
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
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
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: 'BuildingPopupComponent',
    searchActive: false
  }
];
