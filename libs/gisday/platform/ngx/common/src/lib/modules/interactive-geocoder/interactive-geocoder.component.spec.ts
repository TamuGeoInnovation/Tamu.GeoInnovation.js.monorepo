import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveGeocoderComponent } from './interactive-geocoder.component';

describe('InteractiveGeocoderComponent', () => {
  let component: InteractiveGeocoderComponent;
  let fixture: ComponentFixture<InteractiveGeocoderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InteractiveGeocoderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveGeocoderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
