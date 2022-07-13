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
  production: false,
  api_url: 'http://localhost:3333',
  NotificationEvents
};
