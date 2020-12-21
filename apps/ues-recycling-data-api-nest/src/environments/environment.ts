export const environment = {
  production: false,
  port: 3001,
  globalPrefix: '',
  allowedOrigins: ['http://localhost:4200']
};

export { localDbConfig as dbConfig } from './ormconfig';
