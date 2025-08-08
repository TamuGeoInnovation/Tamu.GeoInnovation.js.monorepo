import { TestBed } from '@angular/core/testing';

import { RouteParamsGuard } from './route-params.guard';

describe('RouteParamsGuard', () => {
  let guard: RouteParamsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RouteParamsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
