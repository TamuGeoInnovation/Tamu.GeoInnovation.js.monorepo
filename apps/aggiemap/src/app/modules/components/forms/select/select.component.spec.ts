import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';
import { MapComponent } from '../../../../../../../angular-aggiemap-trees/src/app/components/map/map.component';

describe('SelectComponent', () => {
  it('should create', () => {
    inject([SelectComponent], (component: SelectComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
