// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { LayerSource } from '@tamu-gisc/common/types';
export * from './secrets';

export const environment = {
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export const api_url = 'http://localhost:1337';
export const email_server_url = 'http://mailroom.dev.gsvcs.lan/api/';

export const SearchSources = [];
export const LayerSources: LayerSource[] = [];
