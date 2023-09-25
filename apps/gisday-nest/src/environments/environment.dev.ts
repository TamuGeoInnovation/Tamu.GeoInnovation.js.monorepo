export const environment = {
  production: false,
  port: process.env.PORT || 3333,
  globalPrefix: process.env.GLOBAL_PREFIX || '',
  origins: process.env.ORIGINS.split(',') || []
};
