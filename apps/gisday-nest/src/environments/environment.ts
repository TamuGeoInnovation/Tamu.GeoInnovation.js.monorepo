export const environment = {
  production: false,
  port: 3333,
  globalPrefix: 'api'
};

export { localDbConfig as dbConfig } from './ormconfig';
export { OIDC_ISSUER, OIDC_CLIENT_METADATA, OIDC_CLIENT_PARAMS } from './oidc-client-config';
