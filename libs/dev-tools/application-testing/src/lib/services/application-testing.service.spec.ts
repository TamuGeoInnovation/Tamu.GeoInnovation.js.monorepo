import { TestBed } from '@angular/core/testing';

import { TestingService } from './application-testing.service';

describe('SearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TestingService = TestBed.get(TestingService);
    expect(service).toBeTruthy();
  });
});
