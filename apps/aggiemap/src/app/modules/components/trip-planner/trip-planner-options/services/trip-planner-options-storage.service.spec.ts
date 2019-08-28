import { TestBed } from '@angular/core/testing';

import { TripPlannerOptionsStorageService } from './trip-planner-options-storage.service';

describe('TripPlannerOptionsStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TripPlannerOptionsStorageService = TestBed.get(TripPlannerOptionsStorageService);
    expect(service).toBeTruthy();
  });
});
