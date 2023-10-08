export const environment = {
  production: true
};

export const api_url = `${window.location.origin}/api/gisday`;

export const NotificationEvents = [];

export const auth0 = {
  domain: '#{ANGULAR_AUTH0_DOMAIN}#',
  client_id: '#{ANGULAR_AUTH0_CLIENT_ID}#',
  redirect_uri: window.location.origin + '/callback',
  audience: '#{ANGULAR_AUTH0_AUDIENCE}#',
  roles_claim: '#{ANGULAR_AUTH0_ROLES_CLAIM}#',
  urls: ['https://txgisday.org/api/gisday/', 'https://gisday.tamu.edu/api/gisday/']
};
