import { client_id } from './secrets';
import { notificationEvents } from './notifications';

export const environment = {
  production: true,
  api_url: 'https://idp.geoservices.tamu.edu/api',
  client_id: client_id,
  idp_url: 'https://idp.geoservices.tamu.edu/oidc',
  NotificationEvents: notificationEvents
};
