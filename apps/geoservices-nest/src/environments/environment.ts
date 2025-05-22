export const environment = {
  production: false,
  port: process.env.PORT || 3333,
  origins: process.env?.ORIGINS?.split(',') || [],
  logging: process.env?.LOGGING === 'true' ? true : false,
  globalPrefix: process.env?.GLOBAL_PREFIX || '',
  legacyApiUrl: process.env?.LEGACY_API_URL || 'http://localhost',
  mailroomUrl: process.env.MAILROOM_URL,
  mailroomToAddress: process.env.MAILROOM_TO_ADDRESS,
  turnstileClientKey: process.env.TURNSTILE_SITE_KEY,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  payflowEnvironment: process.env.PAYFLOW_ENVIRONMENT || 'sandbox',
  payflowPartner: process.env.PAYFLOW_PARTNER || 'PayPal',
  payflowMerchant: process.env.PAYFLOW_MERCHANT,
  payflowUser: process.env.PAYFLOW_USER,
  payflowPassword: process.env.PAYFLOW_PASSWORD
};

export { ormConfig } from './definitions';
