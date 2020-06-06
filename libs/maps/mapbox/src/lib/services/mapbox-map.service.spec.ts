import { TestBed } from '@angular/core/testing';

import { MapboxMapService } from './mapbox-map.service';

/* 
Mocked due to issue related to window.URL.createObjectURL https://github.com/mapbox/mapbox-gl-js/issues/3436
*/

jest.mock('mapbox-gl/dist/mapbox-gl', () => ({
  Map: () => ({})
}));

describe('MapboxMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapboxMapService = TestBed.get(MapboxMapService);
    expect(service).toBeTruthy();
  });
});
