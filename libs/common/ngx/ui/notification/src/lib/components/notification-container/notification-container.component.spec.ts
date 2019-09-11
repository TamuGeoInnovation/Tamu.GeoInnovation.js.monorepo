import { inject } from '@angular/core/testing';

import { NotificationContainerComponent } from './notification-container.component';

describe('ContainerComponent', () => {
  it('should create', () => {
    inject([NotificationContainerComponent], (notificationContainerComponent: NotificationContainerComponent) => {
      expect(notificationContainerComponent).toBeTruthy();
    });
  });
});
