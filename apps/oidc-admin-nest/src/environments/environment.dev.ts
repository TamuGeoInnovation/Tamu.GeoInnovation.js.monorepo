export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['https://idp-dev.geoservices.tamu.edu'],
  jwksUrl: 'https://idp-dev.geoservices.tamu.edu/oidc/jwks'
};

export { devDbConfig as dbConfig } from './ormconfig';
