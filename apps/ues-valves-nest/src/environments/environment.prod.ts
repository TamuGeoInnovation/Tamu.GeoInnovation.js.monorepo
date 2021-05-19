export const environment = {
  production: true,
  port: 28054,
  globalPrefix: 'api',
  allowedOrigins: ['http://localhost:4200']
};

export { productionClientConfig as idpConfig } from './oidc-client-config';
