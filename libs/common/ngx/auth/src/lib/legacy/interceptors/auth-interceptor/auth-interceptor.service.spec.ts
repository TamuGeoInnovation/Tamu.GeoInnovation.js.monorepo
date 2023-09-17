import { TestBed } from '@angular/core/testing';

import { LegacyAuthInterceptor } from './auth-interceptor.service';

describe('LegacyAuthInterceptor', () => {
  let service: LegacyAuthInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LegacyAuthInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
