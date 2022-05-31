import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export const notificationEvents: NotificationProperties[] = [
  {
    id: 'add_user_role',
    title: 'User role',
    acknowledge: false,
    message: 'User role has been added'
  },
  {
    id: 'edit_user_role',
    title: 'User role',
    acknowledge: false,
    message: 'User role has been edited'
  },
  {
    id: 'deleted_user_role',
    title: 'User role',
    acknowledge: false,
    message: 'User role has been deleted'
  },
  {
    id: 'add_role',
    title: 'Role',
    acknowledge: false,
    message: 'Role has been added'
  },
  {
    id: 'edit_role',
    title: 'Role',
    acknowledge: false,
    message: 'Role has been edited'
  },
  {
    id: 'deleted_role',
    title: 'Role',
    acknowledge: false,
    message: 'Role has been deleted'
  }
];
