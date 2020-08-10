import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerTopComponent } from './trip-planner-top.component';

describe('TripPlannerTopComponent', () => {
  let component: TripPlannerTopComponent;
  let fixture: ComponentFixture<TripPlannerTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripPlannerTopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlannerTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
