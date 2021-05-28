// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { AuthOptions } from '@tamu-gisc/oidc/client';

export const environment = {
  production: true
};

export * from './definitions';
export * from './notification-events';
export * from './polygons';

export const auth_options: AuthOptions = {
  url: 'https://ues.geoservices.tamu.edu/api/operations',
  attach_href: true
};
