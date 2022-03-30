export const environment = {
  production: true,
  port: 27023,
  globalPrefix: ''
};

export * from './secrets';

export { productionDbConfig as dbConfig } from './ormconfig';
export { productionClientConfig as idpConfig } from './oidc-client-config';
