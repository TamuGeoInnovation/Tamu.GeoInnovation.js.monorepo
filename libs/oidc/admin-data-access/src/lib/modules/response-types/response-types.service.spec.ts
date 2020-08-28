import { TestBed } from '@angular/core/testing';

import { ResponseTypesService } from './response-types.service';

describe('ResponseTypesService', () => {
  let service: ResponseTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponseTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
