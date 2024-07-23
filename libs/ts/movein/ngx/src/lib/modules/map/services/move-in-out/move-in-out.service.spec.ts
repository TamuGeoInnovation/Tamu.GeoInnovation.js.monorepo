import { TestBed } from '@angular/core/testing';

import { MoveinOutService } from './move-in-out.service';

describe('MoveinOutService', () => {
  let service: MoveinOutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoveinOutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
