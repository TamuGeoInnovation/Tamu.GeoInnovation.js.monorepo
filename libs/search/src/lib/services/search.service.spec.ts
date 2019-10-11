import { inject, TestBed } from '@angular/core/testing';

import { SearchResult, SearchService } from './search.service';

describe('SearchService', () => {
  it('should be created', () => {
    inject([SearchService], (searchService: SearchService) => {
      expect(searchService).toBeTruthy();
    });
  });
});

describe('SearchResult', () => {
  it('should list features', () => {
    const search_result = new SearchResult({
      results: [
        {
          features: ['test'],
          breadcrumbs: {
            source: 'tests',
            value: 'probably nothings'
          }
        },
        {
          features: ['test2'],
          breadcrumbs: {
            source: 'tests',
            value: 'probably nothings'
          }
        }
      ]
    });
    expect(search_result.features()).toEqual(['test', 'test2']);
  });
});
