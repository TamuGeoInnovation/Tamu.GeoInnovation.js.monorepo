import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';

import { BasePopupComponent } from '../base/base.popup.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-base-directions',
  templateUrl: './base-directions.component.html',
  styleUrls: ['./base-directions.component.scss']
})
export class BaseDirectionsComponent extends BasePopupComponent implements OnInit, OnDestroy {
  /**
   * Data set by the parent popup component.
   */
  public data: esri.Graphic;

  /**
   * Current href string, used in UI
   */
  public url: string;

  /**
   * Composed URL passed into the copy component
   */
  public shareUrl: string;

  private _searchService = inject(SearchService);

  private _stops: TripPoint[];

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private plannerService: TripPlannerService,
    private analytics: Angulartics2,
    private mapService: EsriMapService
  ) {
    super();
  }

  protected _makeShareUrl(): string {
    const origin = window.location.origin;
    const fragment = this._getShareUrlFragment();
    return fragment ? `${origin}/${fragment}` : origin;
  }

  /**
   * Returns the URL query fragment (e.g. `?bldg=1234`) used to deep-link to this feature.
   * Subclasses should override this to supply the appropriate parameter for their layer.
   */
  protected _getShareUrlFragment(): string | null {
    return null;
  }

  /**
   * Looks up the registered search source by ID and composes a URL query fragment
   * using its configured `urlQueryParam` and the provided attribute value.
   *
   * Subclasses call this from `_getShareUrlFragment()` so that changing a source's
   * `urlQueryParam` in the search source config is automatically reflected here.
   */
  protected _buildShareUrlFragment(sourceId: string, value: string | number): string | null {
    const param = this._searchService.getSource(sourceId)?.urlQueryParam;
    return param ? `?${param}=${value}` : null;
  }

  public ngOnInit(): void {
    this.url = window.location.origin;
    this.shareUrl = this._makeShareUrl();

    this.plannerService.Stops.pipe(takeUntil(this._destroy$)).subscribe((stops) => {
      this._stops = stops;
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  /**
   * Enable trip planning mode setting selected feature as the endpoint.
   *
   * Event called from sub-classes because display fields (e.g. BldgName) are different for
   * different layers and are handled there.
   *
   * @param {string} analyticsLabel Formatted feature name that will be used to report to Google Analytics
   */
  public startDirections(analyticsLabel: string): void {
    this.plannerService.setStops([
      new TripPoint({
        index: this._stops.length - 1,
        source: 'directions-to-here',
        originAttributes: this.data.attributes,
        originGeometry: {
          raw: this.data.geometry
        },
        originParameters: {
          type: 'directions-to-here',
          // Value for this is set during normalization else logic would have to be duplicated here.
          value: {
            source: undefined,
            value: analyticsLabel
          }
        }
      })
    ]);

    // Report to Google Analytics
    const label = {
      guid: guid(),
      date: Date.now(),
      name: analyticsLabel
    };

    this.analytics.eventTrack.next({
      action: 'routing',
      properties: {
        category: 'directions_to_here',
        gstCustom: label
      }
    });

    // Clear the popup as we transition to the trip route
    this.mapService.clearHitTest();

    // Navigate to the trip route
    this.router.navigate(['trip'], { relativeTo: this.route });
  }
}
