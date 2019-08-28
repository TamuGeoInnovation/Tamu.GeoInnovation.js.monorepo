import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, pluck } from 'rxjs/operators';

import { TripPlannerService } from '../../../services/trip-planner/trip-planner.service';
import { TripResult } from '../../../../modules/services/trip-planner/core/trip-planner-core';
import { RouterHistoryService } from '../../../..//modules/services/router-history.service';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

@Component({
  selector: 'app-report-bad-route',
  templateUrl: './report-bad-route.component.html',
  styleUrls: ['./report-bad-route.component.scss']
})
export class ReportBadRouteComponent implements OnInit, OnDestroy {
  public result: TripResult;

  public description: string;
  public email: string;

  public submitted: boolean;

  private _lastRoute: string;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private tripPlanner: TripPlannerService,
    private analytics: Angulartics2,
    private router: Router,
    private history: RouterHistoryService,
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

    this.history
      .last()
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: any) => {
        this._lastRoute = event.url;
      });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Calls analytics event method
   *
   * @memberof ReportBadRouteComponent
   */
  public submitBadRoute() {
    const label = {
      guid: guid(),
      date: Date.now(),
      value: {
        points: this.result.stopsToArray(),
        travelMode: this.result.params.travelMode,
        connection: this.result.connection.name,
        description: this.description ? this.description : 'No Description',
        email: this.email ? this.email : 'No email',
        stops: this.result.stopsSource
      }
    };

    this.analytics.eventTrack.next({
      action: 'Bad Route',
      properties: {
        category: 'Routing',
        label: JSON.stringify(label)
      }
    });

    this.notificationService.preset('feedback_submit');

    this.router.navigate(['map/d/trip']);

    // if (this._lastRoute) {
    //   this.router.navigate([this._lastRoute]);
    // } else {
    //   this.location.back();
    // }
  }
}
