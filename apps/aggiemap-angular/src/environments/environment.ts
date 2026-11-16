// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { factory } from '@tamu-gisc/aggiemap/ngx/common';
export { metadata } from '@tamu-gisc/common/ngx/environment';

export const environment = {
  production: false
};

export { SelectionSymbols, Polygons } from '@tamu-gisc/aggiemap/ngx/common';
export * from './notification-events';

// The local serve. `prod` because localhost reads the production GIS server, and
// `includeDevelopmentOnly` because a layer that is not ready for production is still worked on here
// (#2673) - `environment.prod.ts` leaves those layers out, which is what the public gets.
const sources = factory({
  environment: 'prod',
  includeDevelopmentOnly: true
});

export const { Definitions, Connections, SearchSources, ThreeDLayers, LayerSources } = sources;
