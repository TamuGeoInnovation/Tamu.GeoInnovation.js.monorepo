import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeocodingRequestComponent } from './geocoding-request.component';

describe('GeocodingRequestComponent', () => {
  let component: GeocodingRequestComponent;
  let fixture: ComponentFixture<GeocodingRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeocodingRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeocodingRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
