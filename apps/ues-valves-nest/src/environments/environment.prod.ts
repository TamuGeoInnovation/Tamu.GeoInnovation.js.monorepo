export const environment = {
  production: true,
  port: 27007,
  globalPrefix: '',
  allowedOrigins: [
    'https://maps.apogee.tamu.edu',
    'https://ues-dev.geoservices.tamu.edu',
    'https://ues.geoservices.tamu.edu'
  ]
};

export * from './secrets';

export { productionClientConfig as idpConfig } from './oidc-client-config';
