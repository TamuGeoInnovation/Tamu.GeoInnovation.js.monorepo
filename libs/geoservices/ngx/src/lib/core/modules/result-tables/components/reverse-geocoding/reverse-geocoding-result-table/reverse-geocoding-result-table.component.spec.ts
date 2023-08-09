import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverseGeocodingResultTableComponent } from './reverse-geocoding-result-table.component';

describe('ReverseGeocodingResultTableComponent', () => {
  let component: ReverseGeocodingResultTableComponent;
  let fixture: ComponentFixture<ReverseGeocodingResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReverseGeocodingResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseGeocodingResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
