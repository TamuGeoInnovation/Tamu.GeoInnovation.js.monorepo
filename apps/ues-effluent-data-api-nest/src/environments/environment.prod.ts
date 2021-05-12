export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['https://maps.apogee.tamu.edu', 'https://dev.aggiemap.tamu.edu']
};

export { productionDbConfig as dbConfig } from './ormconfig';
export { productionClientConfig as idpConfig } from './oidc-client-config';
