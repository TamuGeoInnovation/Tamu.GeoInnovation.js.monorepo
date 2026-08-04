import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, pluck } from 'rxjs/operators';

import { TripPlannerService, TripResult } from '@tamu-gisc/maps/feature/trip-planner';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

@Component({
  selector: 'tamu-gisc-report-bad-route',
  templateUrl: './report-bad-route.component.html',
  styleUrls: ['./report-bad-route.component.scss']
})
export class ReportBadRouteComponent implements OnInit, OnDestroy {
  public result: TripResult;

  public description: string;
  public email: string;

  public submitted: boolean;

  private _lastRoute: string;

  private _destroy$: Subject<void> = new Subject();

  constructor(
    private tripPlanner: TripPlannerService,
    private analytics: Angulartics2,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService
  ) {}

  public ngOnInit() {
    this.tripPlanner.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => this.tripPlanner.getTripResultForTravelMode()),
      takeUntil(this._destroy$)
    ).subscribe((result) => {
      this.result = result;
    });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Calls analytics event method
   */
  public submitBadRoute() {
    const travelModeId = this.result && this.result.params && this.result.params.travelMode ? this.result.params.travelMode.id : 'unknown';
    const connectionName = this.result && this.result.connection ? this.result.connection.name : 'unknown';

    const label: Record<string, any> = {
      guid: guid(),
      date: Date.now(),
      travel_mode: travelModeId,
      connection: connectionName,
      description: this.description ? this.description : 'No Description',
      email: this.email ? this.email : 'No email'
      // Might implement this in a custom reporting tool
      // stops: this.result.stopsSource
    };

    // Iterate through each stop in this.result.stopsToArray() and add a property for each stop prefixed with stop_ to label.gstCustom
    const stops = (this.result && typeof this.result.stopsToArray === 'function') ? this.result.stopsToArray() : [];

    stops.forEach((stop, index) => {
      label[`stop_${index}`] = stop.toString();
    });

    this.analytics.eventTrack.next({
      action: 'routing',
      properties: {
        category: 'feedback',
        gstCustom: label
      }
    });

    this.notificationService.preset('feedback_submit');

    this.router.navigate(['map/d/trip']);
  }
}
