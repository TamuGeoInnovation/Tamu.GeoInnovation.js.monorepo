import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerBikingOptionsComponent } from './trip-planner-biking-options.component';

describe('TripPlannerBikingOptionsComponent', () => {
  let component: TripPlannerBikingOptionsComponent;
  let fixture: ComponentFixture<TripPlannerBikingOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripPlannerBikingOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlannerBikingOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
