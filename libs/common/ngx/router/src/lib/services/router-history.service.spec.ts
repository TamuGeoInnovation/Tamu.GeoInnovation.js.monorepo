import { TestBed } from '@angular/core/testing';

import { RouterHistoryService } from './router-history.service';

describe('RouterHistoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RouterHistoryService = TestBed.get(RouterHistoryService);
    expect(service).toBeTruthy();
  });
});
