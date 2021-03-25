export const environment = {
  production: false,
  port: 3333,
  globalPrefix: ''
};

export { localDbConfig as dbConfig } from './ormconfig';
export { OIDC_IDP_ISSUER_URL, OIDC_CLIENT_METADATA_BASIC, OIDC_CLIENT_PARAMS } from './oidc-client-config';
