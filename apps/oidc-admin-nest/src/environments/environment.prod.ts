export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['https://idp-admin.geoservices.tamu.edu'],
  jwksUrl: 'https://idp.geoservices.tamu.edu/oidc/jwks',
  client_id: 'HjNQn3Wzskwc2S-KgrTLX'
};

export { productionDbConfig as dbConfig } from './ormconfig';
