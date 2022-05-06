export const environment = {
  production: true,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: '*'
};

export { devDbConfig as dbConfig } from './ormconfig';
