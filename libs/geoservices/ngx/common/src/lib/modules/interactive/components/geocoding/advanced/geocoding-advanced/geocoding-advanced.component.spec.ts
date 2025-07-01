import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodingAdvancedComponent } from './geocoding-advanced.component';

describe('GeocodingAdvancedComponent', () => {
  let component: GeocodingAdvancedComponent;
  let fixture: ComponentFixture<GeocodingAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeocodingAdvancedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodingAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
