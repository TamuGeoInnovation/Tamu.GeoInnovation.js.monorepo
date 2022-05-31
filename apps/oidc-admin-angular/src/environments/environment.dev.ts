import { notificationEvents } from './notifications';
import { client_id } from './secrets';

export const environment = {
  production: true,
  api_url: 'https://idp-dev.geoservices.tamu.edu/api',
  client_id: client_id,
  idp_url: 'https://idp-dev.geoservices.tamu.edu/oidc',
  NotificationEvents: notificationEvents
};
