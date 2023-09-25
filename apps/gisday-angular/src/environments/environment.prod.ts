export const environment = {
  production: true
};

export const api_url = 'http://localhost:3333/api';

export const auth0 = {
  domain: '#{ANGULAR_AUTH0_DOMAIN}#',
  client_id: '#{ANGULAR_AUTH0_CLIENT_ID}#',
  redirect_uri: window.location.origin + '/callback',
  audience: '#{ANGULAR_AUTH0_AUDIENCE}#',
  roles_claim: '#{ANGULAR_AUTH0_ROLES_CLAIM}#'
};
