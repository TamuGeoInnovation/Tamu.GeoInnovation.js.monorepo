import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { TripPlannerBikingOptionsComponent } from './trip-planner-biking-options.component';

describe('TripPlannerBikingOptionsComponent', () => {
  it('should create', () => {
    inject([TripPlannerBikingOptionsComponent], (component: TripPlannerBikingOptionsComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
