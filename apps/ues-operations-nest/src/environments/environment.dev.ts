export const environment = {
  production: true,
  port: 27005,
  globalPrefix: '',
  allowedOrigins: [
    'https://maps.apogee.tamu.edu',
    'https://ues-dev.geoservices.tamu.edu',
    'https://ues.geoservices.tamu.edu'
  ]
};

export { devClientConfig as idpConfig } from './oidc-client-config';
