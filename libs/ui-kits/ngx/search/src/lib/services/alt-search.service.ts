import { Injectable } from '@angular/core';
import { from, of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { getObjectPropertyValues } from '@tamu-gisc/common/utils/object';

import { SearchService, SearchSource, SearchResult } from '../services/search.service';
import { SearchSelection } from '../components/search/search.component';

import esri = __esri;

/**
 *
 * This service is used for making subsequent search queries using the key-value results from the first to determine geometry,
 * as defined in the `altLookup` property of a `SearchSource`.
 *
 * A case where this is needed is when a top-level search source makes a call to a service using keywords and:
 *
 *  - The response features do not contain geometry
 *  - The feature items contain property values that can be related in another table/service that does contain geometry data.
 */
@Injectable({ providedIn: 'root' })
export class AltSearchHelper {
  private _sources: SearchSource[];

  constructor(private searchService: SearchService, private environment: EnvironmentService) {
    if (this.environment.value('SearchSources')) {
      this._sources = this.environment.value('SearchSources');
    }
  }

  /**
   * From a search result feature selection, determine if the origin search source contains an alt lookup definition.
   *
   * If the alt lookup definition exists, use the result of that query to map/highlight, and invoke popup.
   *
   * If the alt lookup definition does not exist, use the result of the original query to map/highlight, and invoke popup.
   */
  public handleSearchResultFeatureSelection<T extends object>(incoming: SearchSelection<T>) {
    const source = incoming.result?.breadcrumbs?.source;

    if (!source) {
      return of(incoming);
    }

    const altLookup = source.altLookup;

    if (!altLookup) {
      return of(incoming);
    }

    const altSource = this._sources.find((s) => s.source === altLookup.source);

    if (!altSource) {
      return of(incoming);
    }

    const values = getObjectPropertyValues<string>(incoming.selection, altLookup.reference.keys);

    const altSearchResultPromise = (this.searchService.search({
      sources: [altSource as SearchSource],
      values: [values as any],
      stateful: false,
      returnAsPromise: true
    }) as unknown as Promise<SearchResult<esri.Graphic>>).then((res: SearchResult<esri.Graphic> | undefined) => {
      if (res && res.results && res.results[0] && res.results[0].features && res.results[0].features.length > 0) {
        return new SearchSelection({
          type: 'search',
          selection: res.results[0].features[0],
          result: res.results[0]
        });
      }

      return undefined;
    });

    return from(altSearchResultPromise);
  }
}
