import * as dotenv from 'dotenv';
dotenv.config();

export const environment = {
  production: true,
  port: process.env.PORT || 3333,
  origins: process.env?.ORIGINS?.split(',') || [],
  logging: process.env?.LOGGING === 'true' ? true : false,
  globalPrefix: process.env?.GLOBAL_PREFIX || '',
  mailroomUrl: process.env.MAILROOM_URL,
  mailroomFromAddress: process.env.MAILROOM_FROM_ADDRESS
};
