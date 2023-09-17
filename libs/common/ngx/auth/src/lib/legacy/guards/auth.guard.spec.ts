import { TestBed } from '@angular/core/testing';

import { LegacyAuthGuard } from './auth.guard';

describe('LegacyAuthGuard', () => {
  let guard: LegacyAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LegacyAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
