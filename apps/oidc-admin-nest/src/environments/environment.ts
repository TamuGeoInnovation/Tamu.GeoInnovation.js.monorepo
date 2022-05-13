export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['http://localhost:4200'],
  // jwksUrl: 'https://idp-dev.geoservices.tamu.edu/oidc/jwks'
  jwksUrl: 'http://localhost:4001/oidc/jwks',
  client_id: 'zuexi9o0GyCdlyVok9Xp4'
};

export { localDbConfig as dbConfig } from './ormconfig';
