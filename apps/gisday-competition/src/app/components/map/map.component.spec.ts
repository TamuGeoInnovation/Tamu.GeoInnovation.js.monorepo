import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  it('should create', () => {
    inject([MapComponent], (component: MapComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
