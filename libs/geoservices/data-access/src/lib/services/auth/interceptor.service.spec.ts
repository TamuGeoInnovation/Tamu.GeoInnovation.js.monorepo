import { TestBed } from '@angular/core/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AuthInterceptor } from './interceptor.service';

describe('Interceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [EnvironmentModule],
      providers: [
        {
          provide: env,
          useValue: {}
        }
      ]
    })
  );

  it('should be created', () => {
    const service: AuthInterceptor = TestBed.get(AuthInterceptor);
    expect(service).toBeTruthy();
  });
});
