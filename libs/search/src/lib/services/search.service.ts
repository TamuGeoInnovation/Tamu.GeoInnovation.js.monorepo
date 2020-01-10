import { Injectable, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, Observable, BehaviorSubject, forkJoin, of, from } from 'rxjs';
import { toArray, concatMap, switchMap } from 'rxjs/operators';

import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { CompoundOperator, makeWhere } from '@tamu-gisc/common/utils/database';
import { makeUrlParams } from '@tamu-gisc/common/utils/routing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable()
export class SearchService<T> {
  private _sources: SearchSource[];

  private _store: ReplaySubject<SearchResult<T>> = new ReplaySubject(1);
  public store: Observable<SearchResult<T>> = this._store.asObservable();

  private _searching: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public searching: Observable<boolean> = this._searching.asObservable();

  constructor(private http: HttpClient, private environment: EnvironmentService) {
    if (this.environment.value('SearchSources')) {
      this._sources = this.environment.value('SearchSources');
    }
  }

  /**
   * Performs parallel searches with the provided search sources.
   *
   * Sets service state to a single instance of SearchResult, containing
   * the results of all source queries, which notifies all subscribers.
   */
  public search(options: SearchPropertiesObservable): Observable<SearchResult<T>>;
  public search(options: SearchPropertiesPromise): Promise<SearchResult<T>>;
  public search(options: SearchProperties): SearchResult<T>;
  public search(
    options: SearchPropertiesObservable | SearchPropertiesPromise | SearchProperties
  ): SearchResult<T> | Promise<SearchResult<T>> | Observable<SearchResult<T>> {
    // Check we don't have an array for sources
    if (!(options.sources instanceof Array)) {
      console.error(`Method expected a source array.`);
      return;
    }

    if (options.sources.length === 0) {
      console.error(`Expected at least one source. Got ${options.sources.length}.`);
      return;
    }

    // Check that all sources in array exist
    // If the source is a string reference, make sure that reference exists.
    // If the source is not a string (because it's a SearchSource), return truthy.
    const allSourcesExist = options.sources.every((ref) =>
      typeof ref === 'string' ? this._sources.findIndex((source) => ref === source.source) > -1 : true
    );

    if (!allSourcesExist) {
      console.error(`At least one search source does not exist.`);
      return;
    }

    // Match a SearchSource to every provided source.
    // If the source is a string reference, return the reference source.
    // If the source is a SearchSource, return self
    const sources: SearchSource[] = options.sources.map((src) => {
      return typeof src === 'string' ? this._sources.find((s) => s.source === src) : src;
    });

    // Generate an array of http get observables
    const requests = sources.map((source, index) => {
      // Render query with appropriate value.
      const query = this._getUrlQueryParams(options, source, index);

      return this.http.get(`${source.url}/${query}`);
    });

    // Create an array of http get observables for those search sources
    // that contain a scoring where property
    const scoringRequests = sources
      .filter((source, index) => {
        return source.queryParams && source.queryParams.scoringWhere;
      })
      .map((source, index) => {
        // Create a modified SearchProperties object for the single
        const indexOfSourceValueInOptions = sources.findIndex((s) => s.source === source.source);
        let modifiedOptions;

        if (indexOfSourceValueInOptions > -1) {
          modifiedOptions = {
            sources: [sources[indexOfSourceValueInOptions].source],
            values: [options.values[indexOfSourceValueInOptions]]
          };
        } else {
          // If this block is hit, then it means that the provided options sources list does not
          // include the source of the current item we are trying to create a scoring request for.
          //
          // This should never happen, but handling exception just in case.
          throw new Error(`Could not find the referenced '${source.source}' in the original sources.`);
        }

        const modifiedQueryParams: SearchSourceQueryParamsProperties = {
          ...source.queryParams,
          where: source.queryParams.scoringWhere
        };

        // Search source with a modified query params that has the nested socring where `queryParams`.
        const modifiedScoringSource: SearchSource = { ...source, queryParams: modifiedQueryParams };

        // Remove the excess identical scoringWhere clause for the same of cleanliness.
        delete modifiedScoringSource.queryParams.scoringWhere;

        const query = this._getUrlQueryParams(modifiedOptions, modifiedScoringSource, index);

        return this.http.get(`${source.url}/${query}`);
      });

    if (options.stateful !== false) {
      this._searching.next(true);
    }

    const requestStream = from([forkJoin(requests), forkJoin(scoringRequests)]).pipe(
      concatMap((o) => {
        // Resolve and return the forkJoin observable resposne.
        return o;
      }),
      // Collect all forkJoin responses, and emit a single array observable
      toArray(),
      switchMap((responses) => {
        return of({
          base: responses[0],
          scoring: responses[1]
        });
      }),
      switchMap((responses) => {
        // Check if there were any scoring responses.
        //
        // If not, return back the base responses.
        //
        // If there are any, find to which base reponse they belong to and
        // prepend the features.
        if (responses.scoring && responses.scoring.length === 0) {
          return of(responses.base);
        } else {
          // Since the response order is guarantee with forkJoin and concatMap,
          // we are able to map response index to original sources indexes.
          //
          // This means we can know which scoring request response belongs to which
          // base request response allowing us to merge the features from a scoring response
          // with those of a base response.
          const baseIndexes = sources
            .filter((s) => {
              // Filter out the sources with a scoringWhere.
              // The array size for this will be equal to the number of scoring responses.
              return s.queryParams && s.queryParams.scoringWhere;
            })
            .map((s) => {
              // For each source that has scoring where properties, get the index for the
              // string in original sources that is equal to the source identifier.
              //
              // This index will be representative of the array location for a given base reponse
              // and consequently which scoring response belongs to what base response.
              return sources.findIndex((source) => source.source === s.source);
            });

          const baseScoringMerged = responses.base.map((r, i, a) => {
            if (baseIndexes.includes(i)) {
              // This index will correspond to the array location of scoring responses.
              const indexOfScoringResponse = baseIndexes.indexOf(i);

              // This is merging the current base response features, with the
              // features in the scoring response.
              r[sources[i].featuresLocation] = [
                ...responses.scoring[indexOfScoringResponse][sources[i].featuresLocation],
                ...r[sources[i].featuresLocation]
              ];

              // Remove any duplicates in the list.
              // Determine duplication by simple object stringify equivalence.
              r[sources[i].featuresLocation] = r[sources[i].featuresLocation].filter((feature, index, arr) => {
                const findFirstMatchingIndex = arr.findIndex((f) => {
                  return JSON.stringify(f) === JSON.stringify(feature);
                });

                // If the first matching index is equal to the current (smallest) index, it means it's the first
                // time the object has been iterated over.
                //
                // If not, it means there is another identical object in the array prior to this one.
                //
                // Only return the first occurrence, ignore the rest.
                return findFirstMatchingIndex === index;
              });

              return r;
            } else {
              return r;
            }
          });

          return of(baseScoringMerged);
        }
      }),
      switchMap((result: Array<unknown>) => {
        // Create a single SearchResult class instance, where the results of all http results will be placed in
        // the results property.
        return of(
          new SearchResult({
            results: result.map((r, index: number) => {
              return <SearchResultItem<T>>{
                name: sources[index].name,
                // features: r[sources[index].featuresLocation] ? r[sources[index].featuresLocation] : [],
                features: r[sources[index].featuresLocation]
                  ? this.scoreResults(r[sources[index].featuresLocation], sources, index, options.values[index] as string)
                  : [],
                displayTemplate: sources[index].displayTemplate,
                breadcrumbs: {
                  source: sources[index],
                  value: options.values[index]
                }
              };
            })
          })
        );
      })
    );

    if (options.stateful !== false) {
      requestStream.subscribe(
        (results) => {
          this._searching.next(false);

          // If the method was not invoked with a strictly FALSE `stateful` option, set state.
          if (options.stateful === undefined || options.stateful !== false) {
            this._store.next(results);
          }
        },
        (err) => {
          this._searching.next(false);
          throw new Error(err);
        }
      );

      // The default return for this method is an observable.
      // If `returnAsPromise` is not specified OR it's set to false, return the observable value.
      if (!('returnAsPromise' in options) || options.returnAsPromise !== true) {
        return this._store.asObservable();
      }

      // If returnAsPromise is not undefined AND is set to true, return as a promise instead of the default observable.
      if (options.returnAsPromise !== undefined && options.returnAsPromise === true) {
        return this._store.toPromise();
      }
    } else {
      // If method call was not stateful, return the request stream and let callee handle response.

      if (!('returnAsPromise' in options) || options.returnAsPromise !== true) {
        // Handle default obserfable return type.
        return requestStream;
      } else if (options.returnAsPromise !== undefined && options.returnAsPromise === true) {
        // Handle promise return type
        return requestStream.toPromise();
      }
    }
  }

  public clear() {
    // Set result state
    this._store.next(new SearchResult({}));
  }

  /**
   * Generates a URL query params string from the supplied search properties and values,
   * as well as a valid search source.
   *
   * Determines if the search properties are for a singular search query or a series,
   * as those objects have different property names.
   *
   * Automatically determines if the query string should be generated from a template query, or a query params object.
   *
   * @private
   * @param {SearchProperties} options Search properties for a single or multiple queries.
   * @param {SearchSource} source A valid search source.
   * @param {number} indexOverride Optional index override that determines which source and
   * which values from the collection are used.
   * @returns {string} Query string.
   */
  private _getUrlQueryParams(options: SearchProperties, source: SearchSource, indexOverride?: number): string {
    // If an index value is provided, use it instead of attempting to determine index.
    //
    // Reference Github Issue: https://github.tamu.edu/AggieMap/dev.aggiemap.tamu.edu/issues/93
    //
    const srcIndex = indexOverride != null ? indexOverride : options.sources.findIndex((s) => s === source.source);

    if (source.queryParams) {
      // If instead we have query params object which needs to be converted to a url query string.

      // If no where clause exists in the object, throw error. Any query will fail without it.
      if (!source.queryParams.hasOwnProperty('where')) {
        throw new Error('No where property provided.');
      }

      //
      // Uses keys from source config
      const keys = source.queryParams.where.keys;
      //
      // Uses operators from source config
      const operators = source.queryParams.where.operators;

      //
      // Uses wildcards (if any) from source config
      const wildcards = source.queryParams.where.wildcards;

      //
      // Uses transformations (if any) from source config
      const transformations = source.queryParams.where.transformations;

      //
      // Creates a value that matches the number of query param keys.
      //
      // When options.values is an array of strings, each index value is assumed to be repeated
      // over the number of options.keys.
      //
      // When options.values is an array of string-containing arrays, each inner array is assumed to contain the
      // exact number of matching values for the keys in options.keys.
      const values = Array.isArray(options.values[srcIndex])
        ? <Array<string>>options.values[srcIndex]
        : Array(source.queryParams.where.keys.length).fill(options.values[srcIndex]);

      // Generate the SQL WHERE clause from defined keys, values, and operators.
      const where = makeWhere(keys, values, operators, wildcards, transformations);

      // Make shallow copy of the source query params object and set the where value to be the stringified result
      // from `makeWhere`
      const config = { ...source.queryParams, where: where };

      // Make URL param query from the config copy.
      const query = makeUrlParams(config, true, '/query');

      return `${query}`;
    }
  }

  /**
   * Scores and ranks features from a search source response.
   *
   * This addresses the issue in which the map would select the wrong building from any URL parameters. The issue
   * was also present in type-to-search results, but is not nearly as consequential as selecting and focusing the
   * incorrect building from a URL.
   *
   * Reference Github Issue: https://github.tamu.edu/AggieMap/dev.aggiemap.tamu.edu/issues/103
   *
   * @private
   * @param {Array<any>} features Feature collection from a SearchSource response.
   * @param {SearchSource[]} sources Config sources used in a search query.
   * @param {number} responseIndex In a search response collection, the index a particular response. This index
   * corresponds to the source index that contains definitions for feature property value lookups.
   * @param {string} searchTerm The search term utilized in the search query. Used as the comparison string used
   * to set a score and rank.
   */
  private scoreResults(
    features: Array<object>,
    sources: SearchSource[],
    responseIndex: number | 0,
    searchTerm: string
  ): Array<unknown> {
    const source = sources[responseIndex];

    if (source && source.scoringKeys) {
      const ranked = features
        .map((f) => {
          const points = source.scoringKeys.reduce((acc, curr, i) => {
            const propValue: string = getPropertyValue(f, curr);

            if (!propValue) {
              return acc;
            }

            if (propValue.toLowerCase() === searchTerm.toLowerCase()) {
              return acc + source.scoringKeys.length - i;
            } else {
              return acc;
            }
          }, 0);

          // Return the feature, appending a points property that will be used for sorting.
          return { ...f, _score: points };
        })
        .sort((a: { _score: number }, b: { _score: number }) => {
          // Sort results by point count.
          return b._score - a._score;
        })
        .map((f, i) => {
          // Add a rank property based on the sorted array by points.
          return { ...f, _rank: i + 1 };
        });

      return ranked;
    } else {
      return features;
    }
  }
}

export class SearchResult<T> {
  public results: SearchResultsProperties<T>['results'];

  constructor(props: SearchResultsProperties<T>) {
    this.results = props.results || [];
  }

  /**
   * Extracts and flattens feature results from every search item in the SearchResult.
   */
  public features(): T[] {
    return this.results
      .map((resultItem, arr, ind) => {
        return resultItem.features;
      })
      .reduce((prev, curr, index) => {
        return [...prev, ...curr];
      }, []);
  }
}

/**
 * Describes the properties for each search source, used for querying.
 *
 * @export
 * @interface SearchSource
 */
export interface SearchSource {
  /**
   * Value that is used to reference a search source, when specififying an array of search sources.
   *
   * Used in SearchService
   */
  source: string;

  /**
   * Display friendly name used in UI's
   */
  name: string;

  /**
   * Base URL for the search source
   */
  url: string;

  /**
   * Template-capable query string, that will be appended to the base url.
   *
   * Template blocks, if any, will be replaced with provided values using searchOne
   * or searchMany methods in SearchService class.
   */
  query?: string;

  /**
   * SQL `WHERE` component of the query string. If provided, it will be appended to the base query.
   */
  where?: string;

  /**
   * Used in conjuction with the `where` property. This is the search query minus the where clause.
   * Once generated, the `where` clause will be appended to the base query.
   */
  baseQuery?: string;

  /**
   * Query parameter options as JSON.
   *
   * Are compiled into a string at the time of request.
   */
  queryParams?: SearchSourceQueryParamsProperties;

  /**
   * Describes a secondary lookup fired from a primary search emission.
   *
   * Cases where this is used is when the emitted TripResult geometry is not found within the SearchSource result,
   * but instead another SearchSource referenced by a value in the primary search attributes.
   *
   * Example:
   *
   * - Primary Search contains no geometry, but contains attributes
   * - Secondary search constains geometry, matched by a key in the primary search result attributes
   */
  altLookup?: CrossSearchQueryProperties;

  /**
   * Dot nation object path describing the location of the results array
   */
  featuresLocation: string;

  /**
   * Determines if it will be used in search component search queries
   */
  searchActive?: boolean;

  /**
   * Use ONLY if displayTemplate is not provided.
   *
   * An array of valid dot notation property paths for each result feature.
   *
   * Property paths are evaluated and used in UI presentation, as a single space delimited string.
   */
  displayFields?: string[];

  /**
   * Use ONLY if displayFields is not provided.
   *
   * A string with valid dot nodation property path expressions.
   *
   * All expressions in template are evaluated. More flexible than displayFields if as it preserves
   * white space and allows the addition of formatting characters.
   *
   * For example:
   *
   * `{{name}} {{(number)}}` => `Parking Lot (3)`
   */
  displayTemplate?: string;

  /**
   * Optional popup component override.
   *
   * Default set by selection-layer
   */
  // tslint:disable-next-line: no-any
  popupComponent?: any;

  /**
   * A list of dot notation feature properties/attributes in order or raking priority used
   * to sort search results.
   */
  scoringKeys?: string[];
}

/**
 * Defines properties used in an ***optional*** search source `queryParams` object.
 *
 * @interface SearchSourceQueryParamsProperties
 */
export interface SearchSourceQueryParamsProperties {
  /**
   * Specifies the return format.
   */
  f?: 'json' | 'jsonp';

  /**
   * Limits the number of features that are returned by the server.
   */
  resultRecordCount?: number | '*';

  /**
   * Attributes that should be included in any given feature.
   */
  outFields?: '*' | string;

  /**
   * Output Spatial Reference. Most commonly:
   *
   * - 4326
   * - 102100
   */
  outSR?: 4326 | 102100 | number;

  /**
   * Specifies whether the query results should contain its geometry component.
   *
   * Cases where it might not be needed are when the feature will not be mapped.
   */
  returnGeometry?: boolean;

  /**
   * Spatial relationship of the query. Default should be `esriSpatialRelIntersects`
   */
  spatialRel?: string | 'esriSpatialRelIntersects';

  /**
   * Where clause properties that dictate how the search query will be constructed.
   */
  where?: SearchSourceWhereProperties;

  /**
   * If provided, `where` clause properties used to execute a parallel query where the results
   * of both queries are combined and scoring is performed to deliver more accurate search results.
   */
  scoringWhere?: SearchSourceWhereProperties;
}

/**
 * Defines properties used to compose a URL where clause for a given search source.
 *
 * @interface SearchSourceWhereProperties
 */
export interface SearchSourceWhereProperties {
  /**
   * Feature attributes.
   */
  keys: string[];

  /**
   * Operators that should be applied to each feature attribute.
   */
  operators: Array<string | CompoundOperator | 'LIKE' | '=' | '>=' | '<=' | '>' | '<'>;

  /**
   * If provided, determines what wildcard operator is added to the key value.
   *
   *  - startsWith -> `'term%'`
   *  - endsWith -> `'%term'`
   *  - startsWith -> `'%term%'`
   */
  wildcards?: Array<'startsWith' | 'endsWith' | 'includes' | null>;

  /**
   * If provided, determines the transformations applied to keys.
   *
   * Not limited to `UPPER` and `LOWER`. Any SQL function should be supported.
   */
  transformations?: Array<'UPPER' | 'LOWER' | null>;
}

/**
 * Defines the properties used to perform a secondary query based on the results of an initial query.
 *
 * @interface CrossSearchQueryProperties
 */
interface CrossSearchQueryProperties {
  /**
   * Valid search source that will be used for the secondary search query.
   */
  source: string;

  /**
   * Reference keys and values found in the the feature result from an initial query.
   * Values ar used to populate lookup values.
   */
  reference: CrossSearchQueryReferenceProperties;

  /**
   * Lookup keys and values used to create search queries, SQL or otherwise.
   */
  lookup?: CrossSearchQueryLookupProperties;
}

/**
 * Defines the keys in the resulting initial search query result,for which values will be used in subsequent
 * search query.
 *
 * For example:
 *
 * - `Home1` is a property found in the feature result from the search query. It's value is `0908`.
 *
 * The values associated with the keys are directly used to populate a where clause
 *
 * For example:
 *
 * - Value `0908` will match `BldgNum` property in secondary query data source.
 *
 * @interface CrossSearchQueryReferenceProperties
 */
interface CrossSearchQueryReferenceProperties {
  /**
   * Collection of key references found in the feature result from an initial query.
   */
  keys: string[];

  /**
   * Collection of key values.
   *
   * This property is typically populated by internal functions.
   */
  values?: string[];
}

/**
 * Defines the fields that will be used to perform a subsequent query.
 *
 * Keys and values will be transformed and embedded as part of a `where` clause.
 *
 * Example: `BldgNum` key with value `0908` -> `UPPER(BldgNum) = 09098`
 *
 * This transformation is performed for every key-value pair.
 *
 * @interface CrossSearchQueryLookupProperties
 */
interface CrossSearchQueryLookupProperties {
  /**
   *  Collection of keys that will be index-matched with values to create lookup queries, SQL or otherwise.
   */
  keys: string[];

  /**
   * Collection of operators used to generate an SQL where clause.
   *
   * Supported clauses:
   *
   * - `LIKE`
   * - `=`
   */
  operators?: string[];

  /**
   * Collection of key values that are used alongside keys collection to create lookup queries, SQL or otherwise.
   */
  values?: string[];
}

/**
 * Describes the properties utilized by the searchMany class member.
 *
 *
 * @interface SearchProperties
 */
export interface SearchProperties {
  /**
   * A string array of valid search sources.
   */
  sources: (string | SearchSource)[];

  /**
   * An array of values OR an array of string-containing arrays used when parameterizing query for any given source.
   *
   * String array is used for searches using a single search term. Each value index will match with a source index.
   * The single term will be duplicated over however many keys the search source has.
   *
   * An array or string-containing arrays is used for searches using multiple terms. Each array index will match a
   * source index.Inner array length MUST equal the search source key length.
   */
  values?: (string | number)[] | (string | number)[][];

  /**
   * Specifies whether the method will update the service state.
   *
   * Cases where it may not be desired is when a simple lookup is needed, or when the search service instance is at the
   * root-level of the injector hierarchy and service state is not needed/or needs to remain unpolluted to prevent adverse
   * effects.
   *
   * Defaults to true;
   */
  stateful?: boolean;
}

interface SearchPropertiesObservable extends SearchProperties {
  /**
   * Specifies whether the method should return an observable.
   *
   * Will default to false.
   */
  returnObservable?: boolean;
}

interface SearchPropertiesPromise extends SearchProperties {
  /**
   * Specifies whether the method will return a promise.
   *
   * Will default to false.
   */
  returnAsPromise?: boolean;
}

/**
 * Describes the properties as returned in a source query.
 *
 * @interface SearchResultItem
 */
export interface SearchResultItem<T> {
  /**
   * Readable name for the source.
   *
   * Used in UI representation for the search source.
   */
  name?: string;

  /**
   * Use ONLY if displayTemplate is not provided.
   *
   * An array of valid dot notation property paths for each result feature.
   *
   * Property paths are evaluated and used in UI presentation, as a single space delimited string.
   */
  displayFields?: string[];

  /**
   * Use ONLY if displayFields is not provided.
   *
   * A string with valid dot nodation property path expressions.
   *
   * All expressions in template are evaluated. More flexible than displayFields as it preserves
   * white space and allows the addition of formatting characters.
   *
   * For example:
   *
   * `{{name}} ({{number}})` => `Parking Lot (3)`
   */
  displayTemplate?: string;

  /**
   * Array of feature results.
   */
  features?: T[];

  /**
   * Metadata representing the origin (source id and searched term) data used to initialize a search query and
   * ultimately, result.
   */
  breadcrumbs: SearchResultBreadcrumbSummary;
}

export interface SearchResultsProperties<T> {
  results?: SearchResultItem<T>[];
}

/**
 * Used for breadcrumbing.
 *
 * Metadata representing the a search result origin (source id and searched term) data used to initialize a search
 * query and ultimately, result.
 *
 * @export
 * @interface SearchResultSummary
 */
export interface SearchResultBreadcrumbSummary {
  /**
   * Search source reference.
   *
   * Empty string in cases where the search value is not set (using interface for type adherence) or the value is
   * inherited through some other event and thus no further search query needed (e.g. map view click event).
   */
  source: Partial<SearchSource>;

  /**
   * Term used to perform the search query or a value representation of the result from an inherited event.
   */
  value: string | unknown;
}
