import { TestBed } from '@angular/core/testing';

import { EffluentZonesService } from './effluent-zones.service';

describe('EffluentZonesService', () => {
  let service: EffluentZonesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(EffluentZonesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
