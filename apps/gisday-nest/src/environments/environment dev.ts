export const environment = {
  production: false,
  port: 3333,
  globalPrefix: 'api',
  origins: ['http://localhost', 'http://localhost:4200']
};

export * from './secrets';

export { devDbConfig as dbConfig } from './ormconfig';
