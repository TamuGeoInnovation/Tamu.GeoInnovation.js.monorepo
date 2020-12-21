export const environment = {
  production: true,
  port: 3001,
  globalPrefix: '',
  allowedOrigins: ['http://localhost:4200']
};

export { productionDbConfig as dbConfig } from './ormconfig';
