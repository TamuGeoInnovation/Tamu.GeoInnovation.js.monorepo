import { localDbConfig as config } from './ormconfig';

export const environment = {
  production: false,
  port: 3333,
  prefix: 'api'
};

export const dbConfig = config;
