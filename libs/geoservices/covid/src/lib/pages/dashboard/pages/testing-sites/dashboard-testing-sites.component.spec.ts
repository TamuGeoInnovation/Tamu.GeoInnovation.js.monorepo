import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTestingSitesComponent } from './dashboard-testing-sites.component';

describe('DashboardTestingSitesComponent', () => {
  let component: DashboardTestingSitesComponent;
  let fixture: ComponentFixture<DashboardTestingSitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTestingSitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTestingSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
