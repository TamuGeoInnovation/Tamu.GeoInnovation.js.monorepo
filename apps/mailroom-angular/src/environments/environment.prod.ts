import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

const NotificationEvents: NotificationProperties[] = [
  {
    id: 'deleted_email_response',
    title: 'Conversation removed',
    acknowledge: false,
    message: ''
  }
];

export const environment = {
  production: true,
  api_url: 'https://mailroom.gsvcs.lan/api',
  NotificationEvents
};
