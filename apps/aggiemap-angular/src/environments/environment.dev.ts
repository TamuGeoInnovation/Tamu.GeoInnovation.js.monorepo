// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { LayerSource } from '@tamu-gisc/common/types';
import { LayerSources as LS, Definitions, commonLayerProps, Connections as Cns } from './definitions';

export const environment = {
  production: true
};

export * from './definitions';
export * from './notification-events';
export * from './polygons';

export { SearchSources, Definitions, LegendSources, SelectionSymbols } from './definitions';
export * from './notification-events';
export * from './polygons';

export const Connections = {
  ...Cns,
  cms_api: 'http://localhost:1337/api',
  cms_base: 'http://localhost:1337'
};

export const LayerSources = [
  ...LS,
  {
    type: 'geojson',
    id: Definitions.BIKE_LOCATIONS.layerId,
    title: Definitions.BIKE_LOCATIONS.name,
    url: Definitions.BIKE_LOCATIONS.url,
    listMode: 'show',
    visible: false,
    native: {
      ...commonLayerProps,
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

export const ThreeDLayers: Array<LayerSource> = [
  {
    type: 'scene',
    id: 'three-d-buildings-scene-layer',
    title: '3D Buildings',
    url: 'https://arcportal.ts.tamu.edu/arcgis/rest/services/Hosted/ESRI_3D_Presentation_2_0_WSL1/SceneServer',
    listMode: 'show',
    visible: true,
    native: {
      popupEnabled: false
    }
  }
];
