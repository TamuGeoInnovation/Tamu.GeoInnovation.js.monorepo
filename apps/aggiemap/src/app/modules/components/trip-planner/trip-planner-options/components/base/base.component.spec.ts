import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerOptionsBaseComponent } from './base.component';

describe('TripPlannerParkingOptionsBaseComponent', () => {
  let component: TripPlannerOptionsBaseComponent;
  let fixture: ComponentFixture<TripPlannerOptionsBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripPlannerOptionsBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlannerOptionsBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
