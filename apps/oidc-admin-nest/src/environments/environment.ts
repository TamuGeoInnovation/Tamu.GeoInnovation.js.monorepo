export const environment = {
  production: false,
  port: 27000,
  globalPrefix: ''
};

export { localDbConfig as dbConfig } from './ormconfig';
export * from './oidcconfig';
export * from './secrets';
