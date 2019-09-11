import { inject, TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';

describe('SearchService', () => {
  it('should be created', () => {
    inject([SearchService], (searchService: SearchService) => {
      expect(searchService).toBeTruthy();
    });
  });
});
