export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['https://idp-admin-dev.geoservices.tamu.edu'],
  jwksUrl: 'https://idp-dev.geoservices.tamu.edu/oidc/jwks',
  client_id: 'HjNQn3Wzskwc2S-KgrTLX'
};

export { devDbConfig as dbConfig } from './ormconfig';
