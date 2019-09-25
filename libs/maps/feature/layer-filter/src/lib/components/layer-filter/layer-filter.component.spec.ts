import { inject } from '@angular/core/testing';

import { LayerFilterComponent } from './layer-filter.component';

describe('LayerFilterComponent', () => {
  it('should be created', () => {
    inject([LayerFilterComponent], (component: LayerFilterComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
