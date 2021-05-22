import { TestBed } from '@angular/core/testing';

import { VgiService } from './vgi.service';

describe('VgiService', () => {
  let service: VgiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VgiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
