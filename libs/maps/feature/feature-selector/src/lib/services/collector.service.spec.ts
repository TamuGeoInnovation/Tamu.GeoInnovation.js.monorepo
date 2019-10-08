import { inject } from '@angular/core/testing';

import { FeatureCollectorService } from './collector.service';

describe('FeatureCollectorService', () => {
  it('should be created', () => {
    inject([FeatureCollectorService], (service: FeatureCollectorService) => {
      expect(service).toBeTruthy();
    })
  });
});
