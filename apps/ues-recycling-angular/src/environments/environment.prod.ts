import { AuthOptions } from '@tamu-gisc/oidc/client';

export const environment = {
  production: true
};

export * from './definitions';

export const apiUrl = 'https://ues.geoservices.tamu.edu/api/recycling/';
export const auth_options: AuthOptions = {
  url: `https://ues.geoservices.tamu.edu/api/recycling`,
  attach_href: true
};
