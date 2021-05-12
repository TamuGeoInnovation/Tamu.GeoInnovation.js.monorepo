export const environment = {
  port: 27000,
  production: true,
  globalPrefix: ''
};

export { devDbConfig as dbConfig } from './ormconfig';
export { devClientConfig as idpConfig } from './oidc-client-config';
