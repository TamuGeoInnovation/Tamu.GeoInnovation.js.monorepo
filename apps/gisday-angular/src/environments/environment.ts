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
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

export const api_url = 'http://localhost:3333/api'; // This is just some bs URL for now

export * from './common.config';

export const auth0 = {
  domain: '___ANGULAR_AUTH0_DOMAIN___',
  client_id: '___ANGULAR_AUTH0_CLIENT_ID___',
  redirect_uri: window.location.origin + '/callback',
  audience: '___ANGULAR_AUTH0_AUDIENCE___',
  roles_claim: '___ANGULAR_AUTH0_ROLES_CLAIM___',
  urls: ['http://localhost:3333/api/']
};
