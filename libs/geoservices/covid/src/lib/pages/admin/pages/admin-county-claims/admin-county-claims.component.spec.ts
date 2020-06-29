import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCountyClaimsComponent } from './admin-county-claims.component';

describe('AdminCountyClaimsComponent', () => {
  let component: AdminCountyClaimsComponent;
  let fixture: ComponentFixture<AdminCountyClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCountyClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCountyClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
