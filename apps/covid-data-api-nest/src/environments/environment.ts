export const environment = {
  production: false,
  port: 3333,
  globalPrefix: 'api'
};

export { localDbConfig as dbConfig } from './ormconfig';
export { localClientConfig as idpConfig } from './oidc-client-config';
