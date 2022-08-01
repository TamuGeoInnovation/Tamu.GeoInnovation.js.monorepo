import { SECRETS } from './secrets';

export const environment = {
  production: true,
  port: 4001,
  globalPrefix: '',
  allowedOrigins: '*',
  ...SECRETS.ADMIN_DEFAULTS,
  mailroomUrl: SECRETS.MAILROOM.URL,
  mailroomFromAddress: SECRETS.MAILROOM.FROM_EMAIL_ADDRESS
};

export { devDbConfig as dbConfig } from './ormconfig';
