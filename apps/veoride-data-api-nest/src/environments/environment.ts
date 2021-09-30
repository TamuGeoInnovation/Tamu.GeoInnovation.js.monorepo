export const environment = {
  production: false,
  prefix: 'api',
  port: 3333
};

export { config as dbConfig } from './ormconfig';
export { config as appConfig } from './secrets';
