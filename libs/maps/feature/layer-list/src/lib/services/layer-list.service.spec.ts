import { TestBed } from '@angular/core/testing';

import { LayerListService } from './layer-list.service';

describe('LayerListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LayerListService = TestBed.get(LayerListService);
    expect(service).toBeTruthy();
  });
});
