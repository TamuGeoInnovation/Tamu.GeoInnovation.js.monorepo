import { async, inject, TestBed } from '@angular/core/testing';

import { SearchProperties, SearchResult, SearchService } from './search.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

describe('SearchService (no SearchSources)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [HttpClientTestingModule, EnvironmentModule]
    }).compileComponents();
  }));

  it('should be created', inject([SearchService], (searchService: SearchService) => {
    expect(searchService).toBeTruthy();
  }));

  it('should return undefined for invalid configurations', inject([SearchService], (searchService: SearchService) => {
    let console_error_result = '';
    console.error = (message: string) => {
      console_error_result = message;
    };

    expect(searchService.search(({ sources: null } as unknown) as SearchProperties)).toBeUndefined();
    expect(console_error_result).toEqual('Method expected a source array.');

    expect(searchService.search(({ sources: [] } as unknown) as SearchProperties)).toBeUndefined();
    expect(console_error_result).toEqual('Expected at least one source. Got 0.');

    expect(searchService.search(({ sources: ['invalid_name'] } as unknown) as SearchProperties)).toBeUndefined();
    expect(console_error_result).toEqual('At least one search source does not exist.');
  }));

  it('should clear correctly', inject([SearchService], (searchService: SearchService) => {
    searchService.clear();
    searchService.store.forEach((value) => {
      expect(value.features()).toHaveLength(0);
    });
  }));
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
