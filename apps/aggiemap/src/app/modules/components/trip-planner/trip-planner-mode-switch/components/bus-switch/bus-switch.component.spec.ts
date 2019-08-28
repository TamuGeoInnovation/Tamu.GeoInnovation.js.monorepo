import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripPlannerBusModeSwitchComponent } from './bus-switch.component';

describe('BusSwitchComponent', () => {
  let component: TripPlannerBusModeSwitchComponent;
  let fixture: ComponentFixture<TripPlannerBusModeSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripPlannerBusModeSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlannerBusModeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
