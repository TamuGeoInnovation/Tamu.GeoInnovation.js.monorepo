import { inject } from '@angular/core/testing';

import { LayerListService } from './layer-list.service';

describe('LayerListService', () => {
  it('should be created', () => {
    inject([LayerListService], (service: LayerListService) => {
      expect(service).toBeTruthy();
    });
  });
});
