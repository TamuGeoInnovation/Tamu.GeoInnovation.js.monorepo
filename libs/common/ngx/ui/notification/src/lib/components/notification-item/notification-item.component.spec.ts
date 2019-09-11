import { inject } from '@angular/core/testing';

import { NotificationItemComponent } from './notification-item.component';

describe('NotificationItemComponent', () => {
  it('should create', () => {
    inject([NotificationItemComponent], (notificationItemComponent: NotificationItemComponent) => {
      expect(notificationItemComponent).toBeTruthy();
    });
  });
});
