import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLockdownsComponent } from './dashboard-lockdowns.component';

describe('DashboardLockdownsComponent', () => {
  let component: DashboardLockdownsComponent;
  let fixture: ComponentFixture<DashboardLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardLockdownsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLockdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
