import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil, pluck } from 'rxjs/operators';

@Component({
  selector: 'trip-planner-directions-actions',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripPlannerDirectionsActions implements OnInit, OnDestroy {
  /**
   * Constructed share URL based on planner service stops parameters.
   *
   * Passed into clipboard-copy directive which binds a click listener to the element.
   *
   * On event trigger, this text will be copied to the client's clipboard.
   *
   * @type {string}
   * @memberof TripPlannerDirectionsActions
   */
  public shareUrl: string;

  public animating: Observable<boolean>;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private cd: ChangeDetectorRef,
    private analytics: Angulartics2,
    private router: Router,
    private route: ActivatedRoute,
    private plannerService: TripPlannerService
  ) {}

  public ngOnInit(): void {
    this.plannerService.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => this.plannerService.getTripResultForTravelMode()),
      takeUntil(this._destroy$)
    ).subscribe((result) => {
      if (result && result.stops != null) {
        const params = {
          stops: undefined,
          mode: undefined,
          time: undefined,
          at: undefined
        };
        // Get base route path
        const path = this.route.pathFromRoot
          .map((segment) => (segment.routeConfig != null ? segment.routeConfig.path : null))
          .filter((segment) => segment != null)
          .join('/');

        // Get stops to add as params
        params.stops = result.stops
          .filter((s) => {
            return s.exportable;
          })
          .map((stop) => {
            return stop.getIdentifier();
          })
          .map((identifier) => {
            return `@${identifier}`;
          })
          .join('');

        // Get travel mode from result
        params.mode = result.params && result.params.travelMode ? result.params.travelMode : 1;

        if (result.timeMode !== 'now') {
          params.time = result.timeMode;
        }

        if (result.requestedTime != null) {
          params.at = result.requestedTime;
        }

        // Create url tree with application path and params
        const tree = this.router.createUrlTree([path], { queryParams: params });

        // Concatenate origin location and serialized url tree
        this.shareUrl = window.location.origin + this.router.serializeUrl(tree);

        this.cd.markForCheck();
      }
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Component carries a simple button that allows them to call this method.
   *
   * Will submit, through analytics, the details of this result.
   *
   * @memberof TripPlannerDirectionsComponent
   */
  public reportBadRoute(): void {
    this.router.navigate(['map/modal/bad-route']);
  }

  /**
   * Call the trip planner service and call the clear method to remove result, stops, and route
   *
   * @memberof TripPlannerDirectionsComponent
   */
  public eventClearAll(): void {
    this.plannerService.clearAll();

    const label = {
      guid: guid(),
      date: Date.now()
    };

    this.analytics.eventTrack.next({
      action: 'Trip Planner Action - Reset',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify(label)
      }
    });
  }

  public eventCopyTrip() {
    // Route creation analytics tracking
    const label = {
      guid: guid(),
      date: Date.now(),
      value: this.shareUrl
    };

    this.analytics.eventTrack.next({
      action: 'Trip Planner Action - Share',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify(label)
      }
    });
  }
}
