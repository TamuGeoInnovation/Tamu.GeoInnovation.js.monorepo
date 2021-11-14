import { prodDbConfig as config } from './ormconfig';

export const environment = {
  production: true,
  port: 27029,
  prefix: ''
};

export const dbConfig = config;
