import { TestBed } from '@angular/core/testing';

import { TierBenefitService } from './tier-benefit.service';

describe('TierBenefitService', () => {
  let service: TierBenefitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TierBenefitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
