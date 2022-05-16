export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['http://localhost:4200'],
  jwksUrl: 'http://localhost:4001/oidc/jwks',
  client_id: 'HjNQn3Wzskwc2S-KgrTLX'
};

export { localDbConfig as dbConfig } from './ormconfig';
