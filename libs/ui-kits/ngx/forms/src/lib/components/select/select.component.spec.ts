import { async, inject, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [SelectComponent] }).compileComponents();
  }));

  it('should be created', inject([SelectComponent], (component: SelectComponent) => {
    expect(component).toBeTruthy();
  }));

  it('getDataItemValue should handle template being undefined', inject([SelectComponent], (component: SelectComponent) => {
    expect(component.getDataItemValue({ test: 'value' })).toEqual({ test: 'value' });
  }));

  it('getDataItemValue should handle correct inputs', inject([SelectComponent], (component: SelectComponent) => {
    expect(component.getDataItemValue({ test: 'value' }, 'test')).toEqual('value');
  }));
});
