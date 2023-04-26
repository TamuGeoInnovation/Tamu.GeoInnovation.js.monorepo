import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodeResultTableComponent } from './geocode-result-table.component';

describe('GeocodeResultTableComponent', () => {
  let component: GeocodeResultTableComponent;
  let fixture: ComponentFixture<GeocodeResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeocodeResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodeResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
