import { async, inject, TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

describe('NotificationService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
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

  it('should be created', inject([NotificationService], (notificationService: NotificationService) => {
    expect(notificationService).toBeTruthy();
  }));
});
