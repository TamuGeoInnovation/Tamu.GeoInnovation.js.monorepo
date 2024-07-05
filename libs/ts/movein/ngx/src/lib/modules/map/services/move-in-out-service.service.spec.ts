import { TestBed } from '@angular/core/testing';

import { MoveinOutServiceService } from './movein-out-service.service';

describe('MoveinOutServiceService', () => {
  let service: MoveinOutServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoveinOutServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
