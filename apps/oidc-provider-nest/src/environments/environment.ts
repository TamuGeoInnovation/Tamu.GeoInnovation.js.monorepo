import { SECRETS } from './secrets';

export const environment = {
  production: false,
  port: 4001,
  globalPrefix: '',
  allowedOrigins: '*',
  ...SECRETS.ADMIN_DEFAULTS,
  mailroomUrl: SECRETS.MAILROOM.URL,
  mailroomFromAddress: SECRETS.MAILROOM.FROM_EMAIL_ADDRESS
};

export { localDbConfig as dbConfig } from './ormconfig';
