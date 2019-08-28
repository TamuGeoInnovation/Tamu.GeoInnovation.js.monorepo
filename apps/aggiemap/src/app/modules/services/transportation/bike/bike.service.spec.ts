import { TestBed } from '@angular/core/testing';

import { BikeService } from './bike.service';

describe('BikeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BikeService = TestBed.get(BikeService);
    expect(service).toBeTruthy();
  });
});
