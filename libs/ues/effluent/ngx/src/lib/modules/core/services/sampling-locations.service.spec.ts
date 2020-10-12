import { TestBed } from '@angular/core/testing';

import { SamplingLocationsService } from './sampling-locations.service';

describe('SamplingLocationsService', () => {
  let service: SamplingLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(SamplingLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
