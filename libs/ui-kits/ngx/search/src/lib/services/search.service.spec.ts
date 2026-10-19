import { inject, TestBed } from '@angular/core/testing';

import { SearchProperties, SearchResult, SearchService, containsSearch, searchQueryParams } from './search.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { env } from '@tamu-gisc/common/ngx/environment';
import { makeWhere } from '@tamu-gisc/common/utils/database';

describe('SearchService (no SearchSources)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SearchService,
        {
          provide: env,
          useValue: { SearchSources: [] }
        }
      ],
      imports: [HttpClientTestingModule]
    }).compileComponents();
  });

  it('should be created', inject([SearchService], (searchService: SearchService) => {
    expect(searchService).toBeTruthy();
  }));

  it('should return undefined for invalid configurations', inject([SearchService], (searchService: SearchService) => {
    let console_error_result = '';
    console.error = (message: string) => {
      console_error_result = message;
    };

    expect(searchService.search({ sources: null } as unknown as SearchProperties)).toBeUndefined();
    expect(console_error_result).toEqual('Method expected a source array.');

    expect(searchService.search({ sources: [] } as unknown as SearchProperties)).toBeUndefined();
    expect(console_error_result).toEqual('Expected at least one source. Got 0.');

    expect(searchService.search({ sources: ['invalid_name'] } as unknown as SearchProperties)).toBeUndefined();
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
            source: {
              source: 'tests'
            },
            value: 'probably nothings'
          }
        },
        {
          features: ['test2'],
          breadcrumbs: {
            source: {
              source: 'tests'
            },
            value: 'probably nothings'
          }
        }
      ]
    });
    expect(search_result.features()).toEqual(['test', 'test2']);
  });
});

describe('containsSearch', () => {
  it('finds what is typed anywhere in each key, ignoring case, with the shared query parameters', () => {
    expect(containsSearch(['name', 'zone_ID'])).toEqual({
      ...searchQueryParams,
      where: {
        keys: ['name', 'zone_ID'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    });
  });

  it('builds a where clause matching the term anywhere in any key, as the search service sends it', () => {
    const where = containsSearch(['name', 'zone_ID']).where;

    if (!where) {
      throw new Error('containsSearch gave no where clause');
    }

    const sql = makeWhere(where.keys, ['o12', 'o12'], where.operators, where.wildcards as string[], where.transformations as string[]);

    // ESCAPE lets a typed `%` or `_` be matched literally (#1790).
    expect(sql).toBe("UPPER(name) LIKE '%O12%' ESCAPE '\\' OR UPPER(zone_ID) LIKE '%O12%' ESCAPE '\\'");
  });
});
