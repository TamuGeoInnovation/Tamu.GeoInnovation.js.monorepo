import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseGeocodingComponent } from './reverse-geocoding.component';

describe('ReverseGeocodingComponent', () => {
  let component: ReverseGeocodingComponent;
  let fixture: ComponentFixture<ReverseGeocodingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReverseGeocodingComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseGeocodingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
