import { inject } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  it('should be created', () => {
    inject([SelectComponent], (component: SelectComponent) => {
      expect(component).toBeTruthy();
    });
  });
});

describe('getDataItemValue', () => {
  it('should handle template being undefined', () => {
    expect(new SelectComponent().getDataItemValue({ test: 'value' })).toEqual({ test: 'value' });
  });

  it('should handle correct inputs', () => {
    expect(new SelectComponent().getDataItemValue({ test: 'value' }, 'test')).toEqual('value');
  });
});
