import { TestBed } from '@angular/core/testing';

import { LegacyAuthService } from './auth.service';

describe('LegacyAuthService', () => {
  let service: LegacyAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LegacyAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
