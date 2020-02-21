import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoservicesPublicComponent } from './geoservices-public.component';

describe('GeoservicesPublicComponent', () => {
  let component: GeoservicesPublicComponent;
  let fixture: ComponentFixture<GeoservicesPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoservicesPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoservicesPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
