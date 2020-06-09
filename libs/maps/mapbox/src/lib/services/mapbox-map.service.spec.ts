import { TestBed } from '@angular/core/testing';

import { MapboxMapService } from './mapbox-map.service';

describe('MapboxMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapboxMapService = TestBed.get(MapboxMapService);
    expect(service).toBeTruthy();
  });
});
