import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, EnvironmentModule],
      providers: [
        AuthGuard,
        {
          provide: env,
          // AuthGuard pulls in AuthService, which transitively constructs the account services.
          // Those read `legacy_api_url` in their field initialisers, so the environment mock
          // has to carry it or EnvironmentService throws on the missing token.
          useValue: { api_url: 'api', legacy_api_url: 'legacy/' }
        }
      ]
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
