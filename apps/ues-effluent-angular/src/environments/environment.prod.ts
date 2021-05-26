export const environment = {
  production: true
};

import { AuthOptions } from '@tamu-gisc/oidc/client';

export * from './definitions';
export * from './notification-events';

export const apiUrl = `https://nodes.geoservices.tamu.edu/api/ues/effluent/`;

export const auth_options: AuthOptions = {
  url: `https://nodes.geoservices.tamu.edu/api/ues/effluent`,
  attach_href: true
};
