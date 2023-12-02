export const environment = {
  production: true
};

export const api_url = `${window.location.origin}/api/gisday`;

export * from './common.config';

export const auth0 = {
  domain: '___ANGULAR_AUTH0_DOMAIN___',
  client_id: '___ANGULAR_AUTH0_CLIENT_ID___',
  redirect_uri: window.location.origin + '/callback',
  audience: '___ANGULAR_AUTH0_AUDIENCE___',
  roles_claim: '___ANGULAR_AUTH0_ROLES_CLAIM___',
  urls: ['https://txgisday.org/api/gisday/', 'https://gisday.tamu.edu/api/gisday/']
};
