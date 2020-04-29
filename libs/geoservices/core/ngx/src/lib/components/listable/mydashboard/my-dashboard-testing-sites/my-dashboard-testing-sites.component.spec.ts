import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDashboardTestingSitesComponent } from './my-dashboard-testing-sites.component';

describe('MyDashboardTestingSitesComponent', () => {
  let component: MyDashboardTestingSitesComponent;
  let fixture: ComponentFixture<MyDashboardTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDashboardTestingSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDashboardTestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
