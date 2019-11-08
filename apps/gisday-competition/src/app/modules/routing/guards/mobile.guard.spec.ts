import { TestBed, async, inject } from '@angular/core/testing';

import { MobileGuard } from './mobile.guard';

describe('MobileGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MobileGuard]
    });
  });

  it('should ...', inject([MobileGuard], (guard: MobileGuard) => {
    expect(guard).toBeTruthy();
  }));
});
