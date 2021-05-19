import { AuthOptions } from '@tamu-gisc/oidc/client';

export const environment = {
  production: true
};

export * from './definitions';

// App API URL
export const apiUrl = 'https://nodes.geoservices.tamu.edu/api/ues/dispatch';

// IDP client auth options
export const auth_options: AuthOptions = {
  url: apiUrl,
  attach_href: true
};
