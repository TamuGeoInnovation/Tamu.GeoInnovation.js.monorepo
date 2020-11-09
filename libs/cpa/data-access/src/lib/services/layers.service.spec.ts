import { TestBed } from '@angular/core/testing';

import { LayersService } from './layers.service';

describe('LayersService', () => {
  let service: LayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
