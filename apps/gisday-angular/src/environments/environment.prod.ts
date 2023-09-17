export const environment = {
  production: true
};

export const client_id = 'gisday';
export const api_url = 'http://localhost:3333/api';
export const idp_dev_url = 'https://idp-dev.geoservices.tamu.edu/oidc';

export const auth0 = {
  domain: 'DOMAIN',
  client_id: 'CLIENT_ID',
  redirect_uri: window.location.origin + '/callback',
  audience: 'AUDIENCE',
  roles_claim: 'CLAIM_NAME'
};
