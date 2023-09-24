export const environment = {
  production: true
};

export const api_url = 'http://localhost:3333/api';

export const auth0 = {
  domain: 'AUTH0_DOMAIN',
  client_id: 'AUTH0_CLIENT_ID',
  redirect_uri: window.location.origin + '/callback',
  audience: 'AUTH0_AUDIENCE',
  roles_claim: 'AUTH0_ROLES_CLAIM'
};
