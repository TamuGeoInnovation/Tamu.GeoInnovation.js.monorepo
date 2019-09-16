import { inject, TestBed } from '@angular/core/testing';

import { TripPlannerOptionsComponentService } from './trip-planner-options-component.service';

describe('TripPlannerOptionsComponentService', () => {
  it('should be created', () => {
    inject([TripPlannerOptionsComponentService], (service: TripPlannerOptionsComponentService) => {
      expect(service).toBeTruthy();
    });
  });
});
