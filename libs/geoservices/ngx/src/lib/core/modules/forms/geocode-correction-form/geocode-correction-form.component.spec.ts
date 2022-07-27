import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodeCorrectionFormComponent } from './geocode-correction-form.component';

describe('GeocodeCorrectionFormComponent', () => {
  let component: GeocodeCorrectionFormComponent;
  let fixture: ComponentFixture<GeocodeCorrectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeocodeCorrectionFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodeCorrectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
