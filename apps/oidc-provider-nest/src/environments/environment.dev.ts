export const environment = {
  production: true,
  port: 4001,
  globalPrefix: '',
  allowedOrigins: '*'
};

export { devDbConfig as dbConfig } from './ormconfig';
