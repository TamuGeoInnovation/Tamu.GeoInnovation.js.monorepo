import { AuthOptions } from '@tamu-gisc/oidc/client';

export const environment = {
  production: true
};

export * from './definitions';
export const auth_options: AuthOptions = {
  url: `https://nodes.geoservices.tamu.edu/api/ues/dispatch/`,
  attach_href: true
};
