import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(async () =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, EnvironmentModule, SettingsModule],
      providers: [
        AuthService,
        {
          provide: env,
          useValue: { LocalStoreSettings: {} }
        }
      ]
    })
  );

  it('should be created', () => {
    const service = TestBed.get(AuthService);

    expect(service).toBeTruthy();
  });
});
