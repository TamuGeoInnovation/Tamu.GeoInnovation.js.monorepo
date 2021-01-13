export const environment = {
  production: true,
  port: 28052,
  globalPrefix: '',
  allowedOrigins: ['https://dev.aggiemap.tamu.edu']
};

export { productionDbConfig as dbConfig } from './ormconfig';
