import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, pluck } from 'rxjs/operators';
import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { TripResult } from '../../../../../services/trip-planner/core/trip-planner-core';

import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'trip-planner-directions',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class TripPlannerDirectionsComponent implements OnInit, OnDestroy {
  public result: TripResult;

  private _destroy$: Subject<boolean> = new Subject();

  constructor(private router: Router, private plannerService: TripPlannerService, private analytics: Angulartics2) {}

  public ngOnInit() {
    // Subscribe to travel mode state in trip planner and fetch trip result for mode.
    this.plannerService.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => this.plannerService.getTripResultForTravelMode()),
      takeUntil(this._destroy$)
    ).subscribe((res) => {
      this.result = res;
    });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
