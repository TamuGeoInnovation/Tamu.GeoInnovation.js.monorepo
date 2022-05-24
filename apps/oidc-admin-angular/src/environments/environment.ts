// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `workspace.json`.
import { client_id } from './secrets';
import { notificationEvents } from './notifications';

export const environment = {
  production: false,
  api_url: 'http://localhost:27000',
  client_id,
  idp_url: 'http://localhost:4001/oidc',
  NotificationEvents: notificationEvents
};
