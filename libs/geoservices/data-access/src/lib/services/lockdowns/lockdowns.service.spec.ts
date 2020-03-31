import { TestBed } from '@angular/core/testing';

import { LockdownsService } from './lockdowns.service';

describe('LockdownsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LockdownsService = TestBed.get(LockdownsService);
    expect(service).toBeTruthy();
  });
});
