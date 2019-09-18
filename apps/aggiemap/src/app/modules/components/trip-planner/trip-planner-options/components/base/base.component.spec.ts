import { inject } from '@angular/core/testing';

import { TripPlannerOptionsBaseComponent } from './base.component';

describe('TripPlannerParkingOptionsBaseComponent', () => {
  it('should create', () => {
    inject([TripPlannerOptionsBaseComponent], (component: TripPlannerOptionsBaseComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
