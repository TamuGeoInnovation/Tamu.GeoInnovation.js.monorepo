import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';
import { HttpClientModule } from '@angular/common/http';

describe('MapService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [HttpClientModule] }));

  it('should be created', () => {
    const service: MapService = TestBed.get(MapService);
    expect(service).toBeTruthy();
  });
});
