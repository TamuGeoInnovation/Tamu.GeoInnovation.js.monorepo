// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { factory } from '@tamu-gisc/aggiemap/ngx/common';

export const environment = {
  production: true,
  overrideShowDevFeatures: '___SHOW_PRODUCTION_DEV_FEATURES___'
};

export { SelectionSymbols, Polygons } from '@tamu-gisc/aggiemap/ngx/common';

export * from './notification-events';

const sources = factory();

export const { Definitions, LegendSources, SearchSources, ThreeDLayers, LayerSources } = sources;
export const Connections = {
  ...sources.Connections,
  cms_api: 'http://localhost:1337/api',
  cms_base: 'http://localhost:1337'
};
