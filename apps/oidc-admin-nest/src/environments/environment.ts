export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: '*'
};

export { localDbConfig as dbConfig } from './ormconfig';
