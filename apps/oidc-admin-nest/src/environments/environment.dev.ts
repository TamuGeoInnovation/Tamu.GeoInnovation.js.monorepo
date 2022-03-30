export const environment = {
  production: true,
  port: 27000,
  globalPrefix: ''
};

export { devDbConfig as dbConfig } from './ormconfig';
export * from './oidcconfig';
export * from './secrets';
