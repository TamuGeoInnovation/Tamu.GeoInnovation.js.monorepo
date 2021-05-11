export const environment = {
  production: true,
  port: 28050,
  globalPrefix: '',
  allowedOrigins: ['https://maps.apogee.tamu.edu']
};

export { productionClientConfig as idpConfig } from './oidc-client-config';
