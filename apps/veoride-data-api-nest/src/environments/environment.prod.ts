export const environment = {
  production: true,
  prefix: '',
  port: 27000
};

export { prodConfig as dbConfig } from './ormconfig';
export { prodConfig as appConfig } from './secrets';
