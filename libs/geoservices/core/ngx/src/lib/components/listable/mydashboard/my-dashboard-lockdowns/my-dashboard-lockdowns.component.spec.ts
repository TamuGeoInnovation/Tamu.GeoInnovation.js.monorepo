import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDashboardLockdownsComponent } from './my-dashboard-lockdowns.component';

describe('MyDashboardLockdownsComponent', () => {
  let component: MyDashboardLockdownsComponent;
  let fixture: ComponentFixture<MyDashboardLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDashboardLockdownsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDashboardLockdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
