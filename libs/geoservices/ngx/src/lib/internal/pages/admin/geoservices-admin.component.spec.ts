import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoservicesAdminComponent } from './geoservices-admin.component';

describe('GeoservicesAdminComponent', () => {
  let component: GeoservicesAdminComponent;
  let fixture: ComponentFixture<GeoservicesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeoservicesAdminComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GeoservicesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
