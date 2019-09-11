import { TestBed } from '@angular/core/testing';

import { TripPlannerOptionsComponentService } from './trip-planner-options-component.service';

describe('TripPlannerOptionsComponentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TripPlannerOptionsComponentService = TestBed.get(TripPlannerOptionsComponentService);
    expect(service).toBeTruthy();
  });
});
