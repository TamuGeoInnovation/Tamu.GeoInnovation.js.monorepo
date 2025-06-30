import { TestBed } from '@angular/core/testing';

import { TiersService } from './tiers.service';

describe('TiersService', () => {
  let service: TiersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
