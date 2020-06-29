import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoservicesApiComponent } from './geoservices-api.component';

describe('GeoservicesApiComponent', () => {
  let component: GeoservicesApiComponent;
  let fixture: ComponentFixture<GeoservicesApiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GeoservicesApiComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoservicesApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
