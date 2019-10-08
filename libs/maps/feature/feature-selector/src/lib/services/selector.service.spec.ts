import { inject } from '@angular/core/testing';

import { FeatureSelectorService } from './selector.service';

describe('FeatureSelectorService', () => {
  it('should be created', () => {
    inject([FeatureSelectorService], (service: FeatureSelectorService) => {
      expect(service).toBeTruthy();
    });
  });
});
