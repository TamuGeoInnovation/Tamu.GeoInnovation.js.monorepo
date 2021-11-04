export const environment = {
  production: true,
  prefix: '',
  port: 27000
};

export { devConfig as dbConfig } from './ormconfig';
export { devConfig as appConfig } from './secrets';
