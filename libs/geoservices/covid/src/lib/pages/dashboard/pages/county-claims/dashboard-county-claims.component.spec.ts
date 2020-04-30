import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCountyClaimsComponent } from './dashboard-county-claims.component';

describe('DashboardCountyClaimsComponent', () => {
  let component: DashboardCountyClaimsComponent;
  let fixture: ComponentFixture<DashboardCountyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardCountyClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardCountyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
