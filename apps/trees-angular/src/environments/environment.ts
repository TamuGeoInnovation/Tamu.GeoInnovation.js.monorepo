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
    id: d.BUILDINGS.layerId,
    title: d.BUILDINGS.name,
    url: d.BUILDINGS.url,
    popupComponent: d.BUILDINGS.popupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
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
    type: 'feature',
    id: d.CONSTRUCTION.layerId,
    title: d.CONSTRUCTION.name,
    url: d.CONSTRUCTION.url,
    popupComponent: d.CONSTRUCTION.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    legendItems: [
      {
        id: 'construction-legend',
        title: 'Construction Area',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUOI1jYaAyYKGZgf9DGf5TahjjagZGFnQBcg2DOYgFmyAlgLYupAYYYgaORsogNHA0Uig3kJIwhAUXC7oApQAAQ8kZ9+L+/N4AAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: d.TREES.layerId,
    title: d.TREES.name,
    url: d.TREES.url,
    popupComponent: d.TREES.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    legendItems: []
  },
  {
    type: 'graphic',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    popupComponent: 'BuildingPopupComponent'
  },
  {
    type: 'graphic',
    id: 'drawing-layer',
    title: 'Custom Boundary',
    listMode: 'show',
    loadOnInit: true,
    visible: true
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
  }
];
