export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: '*'
};

export { productionDbConfig as dbConfig } from './ormconfig';
