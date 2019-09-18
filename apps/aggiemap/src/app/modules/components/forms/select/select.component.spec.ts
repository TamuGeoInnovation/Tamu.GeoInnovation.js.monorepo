import { inject } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  it('should create', () => {
    inject([SelectComponent], (component: SelectComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
