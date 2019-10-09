import { inject } from '@angular/core/testing';

import { SelectionSummaryComponent } from './summary.component';

describe('SelectionSummaryComponent', () => {
  it('should create', () => {
    inject([SelectionSummaryComponent], (component: SelectionSummaryComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
