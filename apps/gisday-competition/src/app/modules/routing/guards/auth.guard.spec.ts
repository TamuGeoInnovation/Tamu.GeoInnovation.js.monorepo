import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AuthModule } from '../../auth/auth.module';
import { AuthGuard } from './auth.guard';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, AuthModule, EnvironmentModule, SettingsModule],
      providers: [
        AuthGuard,
        {
          provide: env,
          useValue: { LocalStoreSettings: {} }
        }
      ]
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
