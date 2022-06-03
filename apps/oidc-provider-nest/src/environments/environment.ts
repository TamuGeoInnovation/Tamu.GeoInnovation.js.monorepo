export const environment = {
  production: false,
  port: 4001,
  globalPrefix: '',
  allowedOrigins: '*'
};

export { localDbConfig as dbConfig } from './ormconfig';
export { ADMIN_DEFAULTS as ADMIN_DEFAULTS } from './secrets';
