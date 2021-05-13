export const environment = {
  production: true
};

import { AuthOptions } from '@tamu-gisc/oidc/client';

export * from './definitions';
export * from './notification-events';

export const apiUrl = `https://ues-dev.geoservices.tamu.edu/api/operations/`;

export const auth_options: AuthOptions = {
  url: `https://ues-dev.geoservices.tamu.edu/api/operations/`,
  attach_href: true
};
