import { config as c } from './ormconfig';

export const environment = {
  production: false,
  port: 3333,
  prefix: 'api'
};

export const config = c;
export const jwksUrl = 'http://localhost:4001/oidc/jwks';
