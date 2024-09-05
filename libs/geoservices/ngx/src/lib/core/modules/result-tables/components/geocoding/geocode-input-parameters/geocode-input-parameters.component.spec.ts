import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodeInputParametersComponent } from './geocode-input-parameters.component';

describe('GeocodeInputParametersComponent', () => {
  let component: GeocodeInputParametersComponent;
  let fixture: ComponentFixture<GeocodeInputParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeocodeInputParametersComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodeInputParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
