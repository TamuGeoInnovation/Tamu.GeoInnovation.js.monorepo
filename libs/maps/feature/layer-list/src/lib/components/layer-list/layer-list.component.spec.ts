import { inject } from '@angular/core/testing';

import { LayerListComponent } from './layer-list.component';

describe('LayerListComponent', () => {
  it('should be created', () => {
    inject([LayerListComponent], (component: LayerListComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
