import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { AltSearchHelper } from './alt-search.service';
import { SearchResult, SearchService, SearchSource } from './search.service';
import { SearchSelection } from '../components/search/search.component';

/**
 * A search result whose source names an `altLookup` is looked up again in the other source, and the first feature
 * found there becomes the selection (#3495). When that lookup answered no result item at all, reading
 * `results[0].features` threw, so the selection failed with a TypeError rather than saying nothing was found.
 */
describe('AltSearchHelper', () => {
  const ALT: SearchSource = { source: 'building-geometry', name: 'Buildings', url: 'https://example.test/0', featuresLocation: 'features' };
  const ORIGIN: Partial<SearchSource> = {
    source: 'building-names',
    altLookup: { source: 'building-geometry', reference: { keys: ['number'] } }
  };

  function helperAnswering(answer: SearchResult<object>) {
    TestBed.configureTestingModule({
      providers: [
        { provide: EnvironmentService, useValue: { value: () => [ALT] } },
        { provide: SearchService, useValue: { search: () => Promise.resolve(answer) } }
      ]
    });

    return TestBed.inject(AltSearchHelper);
  }

  const selection = new SearchSelection<object>({
    type: 'search',
    selection: { number: '0434' },
    result: { name: 'Buildings', features: [], breadcrumbs: { source: ORIGIN, value: '0434' } }
  });

  it('gives no selection when the lookup answers no result at all', async () => {
    const helper = helperAnswering(new SearchResult({ results: [] }));

    await expect(firstValueFrom(helper.handleSearchResultFeatureSelection(selection))).resolves.toBeUndefined();
  });

  it('selects the first feature the lookup finds', async () => {
    const feature = { attributes: { number: '0434' } };
    const helper = helperAnswering(
      new SearchResult({ results: [{ name: 'Buildings', features: [feature], breadcrumbs: { source: ALT, value: '0434' } }] })
    );

    const chosen = await firstValueFrom(helper.handleSearchResultFeatureSelection(selection));

    expect(chosen).toBeInstanceOf(SearchSelection);
    expect((chosen as SearchSelection<object>).selection).toBe(feature);
  });
});
