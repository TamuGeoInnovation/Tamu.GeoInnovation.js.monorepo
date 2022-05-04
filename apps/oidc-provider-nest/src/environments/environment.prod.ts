export const environment = {
  production: true,
  port: 4001,
  globalPrefix: '',
  allowedOrigins: '/tamu.edu$/'
};

export { productionDbConfig as dbConfig } from './ormconfig';
