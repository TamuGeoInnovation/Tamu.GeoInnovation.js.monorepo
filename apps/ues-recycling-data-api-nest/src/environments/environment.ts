export const environment = {
  production: false,
  port: 3333,
  globalPrefix: 'api',
  allowedOrigins: ['http://localhost:4200']
};

export { localDbConfig as dbConfig } from './ormconfig';
