import { Injectable, Inject, Optional } from '@angular/core';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPoint } from '../services/trip-planner/core/trip-planner-core';

import { getObjectPropertyValues } from '@tamu-gisc/common/utils/object';

import { SearchService, SearchResultBreadcrumbSummary, SearchSource } from '@tamu-gisc/search';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

/**
 *
 * This service is used for making subsequent search queries using the key-value results from the first to determine geometry,
 * as defined in the `altLookup` property of a `SearchSource`.
 *
 * A case where this is needed is when a top-level search source makes a call to a service using keywords and:
 *
 *  - The response features do not contain geometry
 *  - The feature items contain property values that can be related in another table/service that does contain geometry data.
 *
 *
 * @export
 * @class AltSearchHelper
 */
@Injectable()
export class AltSearchHelper {
  private _sources: SearchSource[];

  constructor(
    private mapService: EsriMapService,
    private searchService: SearchService,
    private environment: EnvironmentService
  ) {
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
   *
   * @param {TripPoint} point
   * @memberof AltSearchHelper
   */
  public handleSearchResultFeatureSelection(point: TripPoint): void {
    const source = this._sources.find(
      (s) => s.source === (<SearchResultBreadcrumbSummary>point.originParameters.value).source
    );

    if (source && source.altLookup) {
      const altSource = this._sources.find((s) => s.source === source.altLookup.source);

      const values = getObjectPropertyValues<string>(point.attributes, source.altLookup.reference.keys);

      this.searchService
        .search({
          sources: [altSource.source],
          values: [values],
          returnAsPromise: true,
          stateful: false
        })
        .then((res) => {
          if (res.results && res.results[0].features.length > 0) {
            const altTripPoint = new TripPoint({
              originAttributes: res.results[0].features[0].attributes,
              originGeometry: {
                raw: res.results[0].features[0].geometry
              },
              source: 'search',
              originParameters: { ...point.originParameters }
            }).normalize();

            this.mapService.selectFeatures({
              graphics: [altTripPoint.toEsriGraphic()],
              shouldShowPopup: true,
              popupComponent: altSource && altSource.popupComponent ? altSource.popupComponent : undefined
            });
          }
        });
    } else {
      this.mapService.selectFeatures({
        graphics: [point.toEsriGraphic()],
        shouldShowPopup: true,
        popupComponent: source && source.popupComponent ? source.popupComponent : undefined
      });
    }
  }
}
