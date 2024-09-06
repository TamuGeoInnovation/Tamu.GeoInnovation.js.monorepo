import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseGeocodingBasicComponent } from './reverse-geocoding-basic.component';

describe('ReverseGeocodingBasicComponent', () => {
  let component: ReverseGeocodingBasicComponent;
  let fixture: ComponentFixture<ReverseGeocodingBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReverseGeocodingBasicComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseGeocodingBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
