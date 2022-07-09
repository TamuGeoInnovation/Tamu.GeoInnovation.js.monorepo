import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

const NotificationEvents: NotificationProperties[] = [
  {
    id: 'delete_email',
    title: 'Deleting email...',
    acknowledge: false,
    message: ''
  },
  {
    id: 'deleted_email_response',
    title: 'Conversation removed',
    acknowledge: false,
    message: ''
  }
];

export const environment = {
  production: false,
  NotificationEvents
};
