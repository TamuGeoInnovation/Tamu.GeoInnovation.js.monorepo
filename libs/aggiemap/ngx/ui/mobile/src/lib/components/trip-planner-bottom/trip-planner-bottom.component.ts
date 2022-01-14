import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, pluck } from 'rxjs/operators';

import { TripPlannerService, TripResult } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

@Component({
  selector: 'tamu-gisc-trip-planner-bottom',
  templateUrl: './trip-planner-bottom.component.html',
  styleUrls: ['./trip-planner-bottom.component.scss']
})
export class TripPlannerBottomComponent implements OnInit, OnDestroy {
  /**
   * Unique component identifier generated from the drag state service, and provided to the DragService.
   */
  public identifier: string;

  /**
   * Trip planner subscription that allows a simple check to see if a trip task result has been resolved.
   */
  private _destroy$: Subject<boolean> = new Subject();

  public result: TripResult;

  constructor(private tripPlanner: TripPlannerService, private router: Router, private dragService: DragService) {
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
