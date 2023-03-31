import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodingBasicComponent } from './geocoding-basic.component';

describe('GeocodingBasicComponent', () => {
  let component: GeocodingBasicComponent;
  let fixture: ComponentFixture<GeocodingBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeocodingBasicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodingBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
