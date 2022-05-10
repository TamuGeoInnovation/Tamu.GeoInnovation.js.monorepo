export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['http://localhost:4200'],
  // jwksEndpoint: 'https://idp-dev.geoservices.tamu.edu/oidc/jwks'
  jwksEndpoint: 'http://localhost:4001/oidc/jwks'
};

export { localDbConfig as dbConfig } from './ormconfig';
