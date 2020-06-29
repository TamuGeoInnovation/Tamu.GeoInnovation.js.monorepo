import { TestBed } from '@angular/core/testing';

import { RestrictionsService } from './restrictions.service';

describe('RestrictionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RestrictionsService = TestBed.get(RestrictionsService);
    expect(service).toBeTruthy();
  });
});
