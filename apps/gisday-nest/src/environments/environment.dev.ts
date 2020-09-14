export const environment = {
  port: 27023,
  production: true,
  globalPrefix: ''
};

export { devDbConfig as dbConfig } from './ormconfig';
export { devClientConfig as idpConfig } from './oidc-client-config';
