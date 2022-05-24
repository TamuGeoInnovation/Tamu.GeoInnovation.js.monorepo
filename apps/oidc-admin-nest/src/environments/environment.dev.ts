export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['https://idp-admin-dev.geoservices.tamu.edu'],
  jwksUrl: 'https://idp-dev.geoservices.tamu.edu/oidc/jwks'
};

export { devDbConfig as dbConfig } from './ormconfig';
