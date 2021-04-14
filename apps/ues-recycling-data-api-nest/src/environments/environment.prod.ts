export const environment = {
  production: true,
  port: 28052,
  globalPrefix: '',
  allowedOrigins: ['https://dev.aggiemap.tamu.edu', 'https://ues-dev.geoservices.tamu.edu', 'https://maps.apogee.tamu.edu']
};

export { productionDbConfig as dbConfig } from './ormconfig';
export { productionClientConfig as idpConfig } from './oidc-client-config';
