import { inject } from '@angular/core/testing';

import { LayerListCategorizedComponent } from './layer-list-categorized.component';

describe('LayerListCategorizedComponent', () => {
  it('should be created', () => {
    inject([LayerListCategorizedComponent], (component: LayerListCategorizedComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
