import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerBottomComponent } from './trip-planner-bottom.component';

describe('TripPlannerBottomComponent', () => {
  let component: TripPlannerBottomComponent;
  let fixture: ComponentFixture<TripPlannerBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TripPlannerBottomComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlannerBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
