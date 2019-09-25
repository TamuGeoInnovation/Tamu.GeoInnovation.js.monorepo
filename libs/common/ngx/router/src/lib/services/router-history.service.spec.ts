import { inject } from '@angular/core/testing';

import { RouterHistoryService } from './router-history.service';

describe('RouterHistoryService', () => {
  it('should be created', () => {
    inject([RouterHistoryService], (service: RouterHistoryService) => {
      expect(service).toBeTruthy();
    });
  });
});
