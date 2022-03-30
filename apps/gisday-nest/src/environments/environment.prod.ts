export const environment = {
  production: true,
  port: 27023,
  globalPrefix: ''
};

export const origins = ['http://localhost', 'http://localhost:4200'];

export * from './secrets';

export { productionDbConfig as dbConfig } from './ormconfig';
export { OIDC_IDP_ISSUER_URL, OIDC_CLIENT_METADATA_BASIC, OIDC_CLIENT_PARAMS } from './oidc-client-config';
