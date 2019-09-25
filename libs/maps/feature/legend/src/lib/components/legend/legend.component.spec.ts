import { inject } from '@angular/core/testing';

import { LegendComponent } from './legend.component';

describe('LegendComponent', () => {
  it('should be created', () => {
    inject([LegendComponent], (component: LegendComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
