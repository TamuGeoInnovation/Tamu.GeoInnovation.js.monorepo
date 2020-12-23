import { async, inject, TestBed } from '@angular/core/testing';

import { NotificationContainerComponent } from './notification-container.component';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';
import { Notification } from '../../services/notification.service';

describe('ContainerComponent', () => {
  const testNotification = new Notification({ id: '1', title: 'test', message: 'no' });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationContainerComponent,
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        },
        {
          provide: env,
          useValue: { NotificationEvents: [testNotification] }
        }
      ],
      imports: [EnvironmentModule, StorageServiceModule]
    }).compileComponents();
  }));

  it('should create and close', () => {
    inject([NotificationContainerComponent], (notificationContainerComponent: NotificationContainerComponent) => {
      expect(notificationContainerComponent).toBeTruthy();
      expect(notificationContainerComponent.ngOnInit()).toBeUndefined();
      expect(notificationContainerComponent.close(testNotification)).toBeUndefined();
    })();
  });
});
