import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './interceptor.service';

describe('Interceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthInterceptor = TestBed.get(AuthInterceptor);
    expect(service).toBeTruthy();
  });
});
