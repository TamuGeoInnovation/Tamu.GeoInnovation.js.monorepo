import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoservicesCovidComponent } from './geoservices-covid.component';

describe('GeoservicesCovidComponent', () => {
  let component: GeoservicesCovidComponent;
  let fixture: ComponentFixture<GeoservicesCovidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoservicesCovidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoservicesCovidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
