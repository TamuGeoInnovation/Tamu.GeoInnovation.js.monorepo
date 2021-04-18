export const environment = {
  production: true,
  port: 4001,
  globalPrefix: '',
  create_defaults: true
};

export { productionDbConfig as dbConfig } from './ormconfig';
