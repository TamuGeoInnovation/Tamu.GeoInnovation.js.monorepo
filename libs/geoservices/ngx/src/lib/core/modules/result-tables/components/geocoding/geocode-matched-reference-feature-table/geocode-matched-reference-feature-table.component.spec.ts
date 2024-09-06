import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodeMatchedReferenceFeatureTableComponent } from './geocode-matched-reference-feature-table.component';

describe('GeocodeMatchedReferenceFeatureTableComponent', () => {
  let component: GeocodeMatchedReferenceFeatureTableComponent;
  let fixture: ComponentFixture<GeocodeMatchedReferenceFeatureTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeocodeMatchedReferenceFeatureTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodeMatchedReferenceFeatureTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
