import { AuthOptions } from '@tamu-gisc/oidc/client';

export const environment = {
  production: true
};

export * from './definitions';

// App API URL
export const apiUrl = 'https://ues-dev.geoservices.tamu.edu/api/dispatch/';

// IDP client auth options
export const auth_options: AuthOptions = {
  url: 'https://ues-dev.geoservices.tamu.edu/api/dispatch',
  attach_href: true
};

export const NotificationEvents = [];
