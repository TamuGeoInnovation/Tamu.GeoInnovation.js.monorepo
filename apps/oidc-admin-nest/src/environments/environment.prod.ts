export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['https://idp-admin.geoservices.tamu.edu'],
  jwksUrl: 'https://idp.geoservices.tamu.edu/oidc/jwks'
};

export { productionDbConfig as dbConfig } from './ormconfig';
