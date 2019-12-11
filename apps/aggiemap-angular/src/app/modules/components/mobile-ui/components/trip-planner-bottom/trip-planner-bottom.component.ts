import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { TripResult } from '../../../../services/trip-planner/core/trip-planner-core';
import { UIDragService } from '../../../../services/ui/ui-drag.service';
import { switchMap, takeUntil, pluck } from 'rxjs/operators';

@Component({
  selector: 'app-trip-planner-bottom',
  templateUrl: './trip-planner-bottom.component.html',
  styleUrls: ['./trip-planner-bottom.component.scss']
})
export class TripPlannerBottomComponent implements OnInit, OnDestroy {
  /**
   * Unique component identifier generated from the drag state service, and provided to the UIDragService.
   *
   * @type {string}
   * @memberof TripPlannerBottomComponent
   */
  public identifier: string;

  /**
   * Trip planner subscription that allows a simple check to see if a trip task result has been resolved.
   *
   * @private
   * @type {Subscription}
   * @memberof TripPlannerBottomComponent
   */
  private _destroy$: Subject<boolean> = new Subject();

  public result: TripResult;

  constructor(private tripPlanner: TripPlannerService, private router: Router, private dragService: UIDragService) {
    this.identifier = dragService.register(this);
  }

  public ngOnInit(): void {
    this.tripPlanner.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => this.tripPlanner.getTripResultForTravelMode()),
      takeUntil(this._destroy$)
    ).subscribe((result) => {
      if (result && !result.isError) {
        this.result = result;
      }
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.dragService.unregister(this.identifier);
  }
}
