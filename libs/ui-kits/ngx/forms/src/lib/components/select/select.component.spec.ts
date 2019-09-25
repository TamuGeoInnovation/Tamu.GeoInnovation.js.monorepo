import { inject } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  it('should be created', () => {
    inject([SelectComponent], (component: SelectComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
