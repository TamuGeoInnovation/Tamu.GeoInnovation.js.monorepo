import { TestBed } from '@angular/core/testing';

import { SidebarRedirectGuard } from './sidebar-redirect.guard';

describe('SidebarRedirectGuard', () => {
  let guard: SidebarRedirectGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SidebarRedirectGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
