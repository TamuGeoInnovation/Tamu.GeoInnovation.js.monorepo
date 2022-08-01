import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export const NotificationEvents: NotificationProperties[] = [
  {
    id: 'deleted_email_success',
    title: 'Conversation removed',
    acknowledge: false,
    message: ''
  },
  {
    id: 'deleted_email_failure',
    title: 'mailroom-nest error',
    acknowledge: false,
    message: 'Could not remove email for some reason'
  }
];
