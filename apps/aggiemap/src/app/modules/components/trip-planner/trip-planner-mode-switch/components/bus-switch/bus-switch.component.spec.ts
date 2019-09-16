import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TripPlannerBusModeSwitchComponent } from './bus-switch.component';

describe('BusSwitchComponent', () => {
  it('should create', () => {
    inject([TripPlannerBusModeSwitchComponent], (component: TripPlannerBusModeSwitchComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
