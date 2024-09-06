export const environment = {
  production: false,
  port: process.env.PORT || 3333,
  origins: process.env?.ORIGINS?.split(',') || [],
  logging: process.env?.LOGGING === 'true' ? true : false,
  globalPrefix: process.env?.GLOBAL_PREFIX || '',
  mailroomUrl: process.env.MAILROOM_URL,
  mailroomFromAddress: process.env.MAILROOM_FROM,
  mailroomToAddress: process.env.MAILROOM_TO,
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED === 'true' ? true : false
};
