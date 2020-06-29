import { TestBed } from '@angular/core/testing';

import { ResponseService } from './response.service';

describe('ResponseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResponseService = TestBed.get(ResponseService);
    expect(service).toBeTruthy();
  });
});
