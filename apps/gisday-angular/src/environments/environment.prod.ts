export const environment = {
  production: true
};

export const api_url = `${window.location.origin}/api/gisday`;

export const NotificationEvents = [];

export const auth0 = {
  domain: '__{ANGULAR_AUTH0_DOMAIN}__',
  client_id: '__{ANGULAR_AUTH0_CLIENT_ID}__',
  redirect_uri: window.location.origin + '/callback',
  audience: '__{ANGULAR_AUTH0_AUDIENCE}__',
  roles_claim: '__{ANGULAR_AUTH0_ROLES_CLAIM}__',
  urls: ['https://txgisday.org/api/gisday/', 'https://gisday.tamu.edu/api/gisday/']
};
