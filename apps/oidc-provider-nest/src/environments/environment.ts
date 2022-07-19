import { SECRETS } from './secrets';

export const environment = {
  production: false,
  port: 4001,
  globalPrefix: '',
  allowedOrigins: '*',
  ...SECRETS.ADMIN_DEFAULTS,
  mailroomUrl: SECRETS.MAILROOM_URL
};

export { localDbConfig as dbConfig } from './ormconfig';
