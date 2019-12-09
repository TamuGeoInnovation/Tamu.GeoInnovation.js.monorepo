import { async, inject, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';
import { componentFactoryName } from '@angular/compiler';

describe('SelectComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [SelectComponent] }).compileComponents();
  }));

  it('should be created', inject([SelectComponent], (component: SelectComponent<string>) => {
    expect(component).toBeTruthy();
  }));

  it('getDataItemValue should handle template being undefined', inject(
    [SelectComponent],
    (component: SelectComponent<string>) => {
      expect(component.getDataItemValue({ test: 'value' })).toEqual({ test: 'value' });
    }
  ));

  it('getDataItemValue should handle correct inputs', inject([SelectComponent], (component: SelectComponent<string>) => {
    expect(component.getDataItemValue({ test: 'value' }, 'test')).toEqual('value');
  }));

  it('should respond to keyboard events', (done) => {
    inject([SelectComponent], (component: SelectComponent<string>) => {
      component.changed.subscribe((emitted) => {
        expect(emitted).toEqual('test');
        done();
      });
      component.value = 'test';
      component.changeEvent(new Event('test'));
    })();
  });
});
