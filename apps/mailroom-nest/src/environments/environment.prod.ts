import * as dotenv from 'dotenv';
dotenv.config();

export const environment = {
  production: true,
  dev: process.env?.DEV_MODE || false,
  port: process.env.PORT || 3333,
  globalPrefix: process.env?.GLOBAL_PREFIX || '',
  origins: process.env?.ORIGINS?.split(',') || [],
  logging: process.env?.LOGGING === 'true' ? true : false
};

export const ormConfig = {
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' ? true : false,
  dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true' ? true : false,
  logging: process.env.TYPEORM_LOGGING === 'true' ? true : false,
  extra: process.env.TYPEORM_EXTRA
};
