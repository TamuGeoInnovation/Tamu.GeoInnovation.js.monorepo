// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

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
// import 'zone.js/plugins/zone-error';  // Included with Angular CL I.

export const api_url = `${window.location.origin}/api`;

export * from './common.config';

export const auth0 = {
  domain: '__{ANGULAR_AUTH0_DOMAIN}__',
  client_id: '__{ANGULAR_AUTH0_CLIENT_ID}__',
  redirect_uri: window.location.origin + '/callback',
  audience: '__{ANGULAR_AUTH0_AUDIENCE}__',
  roles_claim: '__{ANGULAR_AUTH0_ROLES_CLAIM}__',
  urls: ['https://gisday-dev.geoservices.tamu.edu/api/']
};
