import { devConfig as c } from './ormconfig';

export const environment = {
  production: true,
  port: 27020,
  prefix: ''
};

export const config = c;
export const jwksUrl = 'https://idp-dev.geoservices.tamu.edu/oidc/jwks';
