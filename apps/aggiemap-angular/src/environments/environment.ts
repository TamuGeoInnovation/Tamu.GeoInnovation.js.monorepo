// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { LayerSources as LS, Definitions, commonLayerProps } from './definitions';

export const environment = {
  production: false
};

export { SearchSources, Connections, Definitions, LegendSources, SelectionSymbols } from './definitions';
export * from './notification-events';
export * from './polygons';

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
