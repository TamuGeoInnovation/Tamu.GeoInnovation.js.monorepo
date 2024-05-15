// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `workspace.json`.

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

export const api_url = `http://localhost:3334`;
export const legacy_api_url = `/legacy/`;
export const accounts_url = `${window.location.protocol}//${window.location.hostname}/wap.accounts.geoservices.tamu.edu`;
export const geoprocessing_api_host_override = 'http://localhost/wap.api.geoservices.tamu.edu.5.0.0/';

export const release_id = 'v0.0.0';
export const machine_name = 'localhost';
export const environment_mode = 'Local';

export * from './definitions';
