export const environment = {
  production: false,
  port: 3001,
  globalPrefix: ''
};

export { localDbConfig as dbConfig } from './ormconfig';
export { localClientConfig as idpConfig } from './oidc-client-config';
