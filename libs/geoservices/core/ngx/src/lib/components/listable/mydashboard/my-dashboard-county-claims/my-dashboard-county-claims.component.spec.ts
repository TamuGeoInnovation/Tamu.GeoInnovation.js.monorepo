import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDashboardCountyClaimsComponent } from './my-dashboard-county-claims.component';

describe('MyDashboardCountyClaimsComponent', () => {
  let component: MyDashboardCountyClaimsComponent;
  let fixture: ComponentFixture<MyDashboardCountyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDashboardCountyClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDashboardCountyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
