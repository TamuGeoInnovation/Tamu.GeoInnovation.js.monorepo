import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { StorageServiceModule, LOCAL_STORAGE } from 'angular-webstorage-service';

import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [StorageServiceModule, EnvironmentModule, HttpClientModule],
      providers: [
        {
          provide: env,
          useValue: { covid_api_url: 'https://' }
        },
        {
          provide: AppStorage,
          useExisting: LOCAL_STORAGE
        }
      ]
    })
  );

  it('should be created', () => {
    const service: IdentityService = TestBed.get(IdentityService);
    expect(service).toBeTruthy();
  });
});
