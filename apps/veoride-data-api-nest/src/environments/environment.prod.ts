export const environment = {
  production: true,
  prefix: '',
  port: 3333
};

export { prodConfig as dbConfig } from './ormconfig';
export { prodConfig as appConfig } from './secrets';
