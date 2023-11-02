export const environment = {
  production: false,
  port: process.env.PORT || 3333,
  globalPrefix: process.env?.GLOBAL_PREFIX || '',
  origins: process.env?.ORIGINS?.split(',') || [],
  logging: process.env?.LOGGING === 'true' ? true : false,
  auth0_audience: process?.env?.AUTH0_AUDIENCE,
  auth0_issuerUrl: process?.env?.AUTH0_ISSUER_URL,
  auth0_management_domain: process?.env?.AUTH0_MANAGEMENT_DOMAIN,
  auth0_management_clientId: process?.env?.AUTH0_MANAGEMENT_CLIENT,
  auth0_management_clientSecret: process?.env?.AUTH0_MANAGEMENT_SECRET
};

export const ormConfig = {
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' ? true : false,
  dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true' ? true : false,
  logging: process.env.TYPEORM_LOGGING === 'true' ? true : false,
  extra: process.env.TYPEORM_EXTRA
};

//
