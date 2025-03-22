export const environment = {
  production: false,
  port: process.env.PORT || 3333,
  origins: process.env?.ORIGINS?.split(',') || [],
  logging: process.env?.LOGGING === 'true' ? true : false,
  globalPrefix: process.env?.GLOBAL_PREFIX || '',
  mailroomUrl: process.env.MAILROOM_URL,
  mailroomFromAddress: process.env.MAILROOM_FROM_ADDRESS,
  turnstileClientKey: process.env.TURNSTILE_SITE_KEY,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY
};
