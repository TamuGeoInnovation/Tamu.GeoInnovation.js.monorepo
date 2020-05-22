import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, EnvironmentModule, SettingsModule],
      providers: [
        AuthGuard,
        {
          provide: env,
          useValue: { api_url: 'api' }
        }
      ]
      
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));

});
 