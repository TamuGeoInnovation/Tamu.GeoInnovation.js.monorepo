import { AuthOptions } from '@tamu-gisc/oidc/client';

export const environment = {
  production: true
};

export * from './definitions';

export const apiUrl = 'https://nodes.geoservices.tamu.edu/api/ues/recycling/';
export const auth_options: AuthOptions = {
  url: `https://nodes.geoservices.tamu.edu/api/ues/recycling`,
  attach_href: true
};
