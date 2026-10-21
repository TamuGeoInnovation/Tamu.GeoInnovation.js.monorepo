// Replaces `environment.ts` for `nx serve gisday-angular --configuration=local` (docs/gisday-local.md).
//
// Deployed images replace the `___ANGULAR_AUTH0_...___` placeholders in `common.config.ts` when they
// start; a local serve does not, so sign-in went to a host named after the placeholder (#1522). These
// are the values for the "GIS Day (local development)" application in the development Auth0 tenant,
// txgisday-dev, which scripts/gisday-auth0-dev.ps1 builds (#1623). It only accepts sign-ins that return
// to http://localhost:4201, and its accounts are test accounts, never production's. None is a secret:
// a single-page application sends them to every browser.

import { api_url } from './common.config';

export const environment = {
  production: false
};

export * from './common.config';

export const auth0 = {
  // The development tenant; the local API checks tokens against the same issuer (local.env.sample).
  domain: 'txgisday-dev.us.auth0.com',
  client_id: 'MK6AwXWdtd7XLsadK00plQIVT5UtcZ1u',
  redirect_uri: window.location.origin + '/callback',
  audience: 'gisday.dev.api',
  roles_claim: 'geoservices.prod/roles',
  // The token goes only to the API, which the dev server's proxy serves under the placeholder path.
  urls: [api_url]
};
