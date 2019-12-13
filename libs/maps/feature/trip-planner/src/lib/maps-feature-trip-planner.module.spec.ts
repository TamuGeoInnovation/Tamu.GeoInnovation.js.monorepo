import { async, TestBed } from '@angular/core/testing';
import { MapsFeatureTripPlannerModule } from './maps-feature-trip-planner.module';

describe('MapsFeatureTripPlannerModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFeatureTripPlannerModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFeatureTripPlannerModule).toBeDefined();
  });
});
