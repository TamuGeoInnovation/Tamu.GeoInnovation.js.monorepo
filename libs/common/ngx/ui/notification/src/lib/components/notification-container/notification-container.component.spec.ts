import { async, inject, TestBed } from '@angular/core/testing';

import { NotificationContainerComponent } from './notification-container.component';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

describe('ContainerComponent', () => {
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
          useValue: { NotificationEvents: [] }
        }
      ],
      imports: [EnvironmentModule, StorageServiceModule]
    }).compileComponents();
  }));

  it('should create', inject(
    [NotificationContainerComponent],
    (notificationContainerComponent: NotificationContainerComponent) => {
      expect(notificationContainerComponent).toBeTruthy();
    }
  ));
});
