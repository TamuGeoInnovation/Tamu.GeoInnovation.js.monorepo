import { TestBed } from '@angular/core/testing';

import { SponsorService } from './sponsor.service';

describe('SponsorService', () => {
  let service: SponsorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SponsorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
