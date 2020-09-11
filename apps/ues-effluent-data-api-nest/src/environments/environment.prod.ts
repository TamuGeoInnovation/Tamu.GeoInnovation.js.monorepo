export const environment = {
  production: true,
  port: 28050,
  globalPrefix: '',
  allowedOrigins: ['https://login.microsoftonline.com', 'http://maps.apogee.tamu.edu', 'https://dev.aggiemap.tamu.edu']
};

export { productionDbConfig as dbConfig } from './ormconfig';
export { productionClientConfig as idpConfig } from './oidc-client-config';
