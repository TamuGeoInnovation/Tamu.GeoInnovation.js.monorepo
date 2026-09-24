import { async, inject, TestBed } from '@angular/core/testing';

import { NotificationContainerComponent } from './notification-container.component';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';
import { Angulartics2 } from 'angulartics2';

import { Notification } from '../../helpers/notification.helper';

describe('ContainerComponent', () => {
  const testNotification = new Notification({ id: '1', title: 'test', message: 'no' });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationContainerComponent,
        {
          // NotificationContainerComponent injects Angulartics2, which needs
          // RouterlessTracking. Mocked rather than importing the real module, matching
          // the pattern in parking-lot.component.spec.ts.
          provide: Angulartics2,
          useValue: { eventTrack: { next: jest.fn() } }
        },
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
