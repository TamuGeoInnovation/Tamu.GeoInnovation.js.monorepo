export const environment = {
  production: false,
  port: 27000,
  globalPrefix: '',
  allowedOrigins: ['http://localhost:4200']
};

export { localDbConfig as dbConfig } from './ormconfig';
