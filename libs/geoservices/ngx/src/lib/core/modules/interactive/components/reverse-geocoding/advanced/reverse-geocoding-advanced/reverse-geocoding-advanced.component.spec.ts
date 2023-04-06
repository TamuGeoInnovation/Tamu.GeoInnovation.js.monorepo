import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseGeocodingAdvancedComponent } from './reverse-geocoding-advanced.component';

describe('ReverseGeocodingAdvancedComponent', () => {
  let component: ReverseGeocodingAdvancedComponent;
  let fixture: ComponentFixture<ReverseGeocodingAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReverseGeocodingAdvancedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseGeocodingAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

