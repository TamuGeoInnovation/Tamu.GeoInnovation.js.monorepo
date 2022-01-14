import { TestBed } from '@angular/core/testing';

import { LogoutGuard } from './logout-guard.guard';

describe('LogoutGuard', () => {
  let guard: LogoutGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LogoutGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
