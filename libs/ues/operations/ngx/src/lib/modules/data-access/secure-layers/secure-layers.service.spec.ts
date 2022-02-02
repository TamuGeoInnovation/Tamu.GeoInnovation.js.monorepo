import { TestBed } from '@angular/core/testing';

import { SecureLayers } from './secure-layers.service';

describe('SecureLayers', () => {
  let service: SecureLayers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureLayers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
