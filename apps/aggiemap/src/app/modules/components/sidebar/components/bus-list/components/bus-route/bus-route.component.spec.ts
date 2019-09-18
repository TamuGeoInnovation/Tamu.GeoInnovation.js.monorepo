import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { BusRouteComponent } from './bus-route.component';

describe('BusRouteComponent', () => {
  it('should create', () => {
    inject([BusRouteComponent], (component: BusRouteComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
