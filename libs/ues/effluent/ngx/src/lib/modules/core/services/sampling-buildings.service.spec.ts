import { TestBed } from '@angular/core/testing';

import { SamplingBuildingsService } from './sampling-buildings.service';

describe('SamplingBuildingsService', () => {
  let service: SamplingBuildingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(SamplingBuildingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
