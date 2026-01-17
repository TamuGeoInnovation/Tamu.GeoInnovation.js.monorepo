// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { factory } from '@tamu-gisc/aggiemap/ngx/common';
export { metadata } from '@tamu-gisc/common/ngx/environment';

export const environment = {
  production: true
};

export { SelectionSymbols, Polygons } from '@tamu-gisc/aggiemap/ngx/common';

export * from './notification-events';

const sources = factory({
  environment: 'prod',
  layerSources: {
    exclude: ['BIKE_LOCATIONS']
  }
});

export const { Definitions, SearchSources, ThreeDLayers, LayerSources } = sources;

export const Connections = {
  ...sources.Connections,
  cms_api: '___CMS_API___',
  cms_base: '___CMS_BASE___'
};
