export const environment = {
  production: true,
  port: 27023,
  globalPrefix: '',
  origins: ['http://localhost', 'http://localhost:4200']
};

export * from './secrets';

export { productionDbConfig as dbConfig } from './ormconfig';
