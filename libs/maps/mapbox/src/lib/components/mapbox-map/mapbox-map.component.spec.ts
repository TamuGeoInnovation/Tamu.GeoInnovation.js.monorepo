import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxMapComponent } from './mapbox-map.component';

/* 
Mocked due to issue related to window.URL.createObjectURL https://github.com/mapbox/mapbox-gl-js/issues/3436
*/

jest.mock('mapbox-gl/dist/mapbox-gl', () => ({
  GeolocateControl: jest.fn(),
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn()
  })),
  NavigationControl: jest.fn()
}));

describe('MapboxMapComponent', () => {
  let component: MapboxMapComponent;
  let fixture: ComponentFixture<MapboxMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapboxMapComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboxMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
