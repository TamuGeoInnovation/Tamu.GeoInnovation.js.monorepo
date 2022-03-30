export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: [
    'https://maps.apogee.tamu.edu',
    'https://ues-dev.geoservices.tamu.edu',
    'https://ues.geoservices.tamu.edu'
  ]
};

export { productionDbConfig as dbConfig } from './ormconfig';
export { productionClientConfig as idpConfig } from './oidc-client-config';
export * from './secrets';
