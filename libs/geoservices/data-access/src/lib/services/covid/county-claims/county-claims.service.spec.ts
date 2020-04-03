import { TestBed } from '@angular/core/testing';

import { CountyClaimsService } from './county-claims.service';

describe('CountyClaimsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CountyClaimsService = TestBed.get(CountyClaimsService);
    expect(service).toBeTruthy();
  });
});
