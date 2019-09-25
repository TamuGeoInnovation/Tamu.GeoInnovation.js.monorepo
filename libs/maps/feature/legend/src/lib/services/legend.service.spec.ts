import { inject } from '@angular/core/testing';

import { LegendService } from './legend.service';

describe('LegendService', () => {
  it('should be created', () => {
    inject([LegendService], (service: LegendService) => {
      expect(service).toBeTruthy();
    });
  });
});
