import { inject, TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('should be created', () => {
    inject([NotificationService], (notificationService: NotificationService) => {
      expect(notificationService).toBeTruthy();
    });
  });
});
