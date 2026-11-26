import { Injectable, inject } from '@angular/core';
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
  private searchService = inject(SearchService);
  private environment = inject(EnvironmentService);

  private _sources: SearchSource[];

  constructor() {
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
    const altLookup = incoming.result?.breadcrumbs.source?.altLookup;

    if (altLookup) {
      // A lookup naming a source that is not configured failed a step later, reading the missing source's url; it
      // still fails, saying which source (#3495).
      const altSource = this._sources.find((s) => s.source === altLookup.source);

      if (!altSource) {
        throw new Error(`Alt lookup source '${altLookup.source}' is not a configured search source.`);
      }

      const values = getObjectPropertyValues<string>(incoming.selection, altLookup.reference.keys);

      const pending = this.searchService.search<esri.Graphic>({
        sources: [altSource],
        values: [values],
        stateful: false,
        returnAsPromise: true
      });

      if (!pending) {
        throw new Error(`The alt lookup search on '${altLookup.source}' could not be made.`);
      }

      // No feature found gives no selection. A lookup answering no result item at all used to throw reading
      // `results[0].features` instead (#3495).
      const altSearchResult = pending.then((res: SearchResult<esri.Graphic> | undefined) => {
        const first = res?.results[0];
        const feature = first?.features?.[0];

        if (first && feature) {
          return new SearchSelection({
            type: 'search',
            selection: feature,
            result: first
          });
        }

        return undefined;
      });

      return from(altSearchResult);
    } else {
      // Do return here
      return of(incoming);
    }
  }
}
