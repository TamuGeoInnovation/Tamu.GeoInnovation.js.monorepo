import { TestBed } from '@angular/core/testing';

import { FeatureCollectorService } from './collector.service';

describe('FeatureCollectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeatureCollectorService = TestBed.get(FeatureCollectorService);
    expect(service).toBeTruthy();
  });
});
