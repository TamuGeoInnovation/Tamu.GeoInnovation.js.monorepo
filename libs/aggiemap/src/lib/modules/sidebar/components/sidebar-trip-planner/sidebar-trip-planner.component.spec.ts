import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarTripPlannerComponent } from './sidebar-trip-planner.component';

describe('SidebarTripPlannerComponent', () => {
  let component: SidebarTripPlannerComponent;
  let fixture: ComponentFixture<SidebarTripPlannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarTripPlannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarTripPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
