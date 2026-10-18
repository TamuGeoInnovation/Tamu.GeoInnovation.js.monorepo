import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, pluck } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripResult } from '../../../../core/trip-planner-core';
import { TripPlannerDirectionsActionsComponent } from '../../../trip-planner-directions-actions/containers/base/base.component';
import { TripPlannerModeSwitchComponent } from '../../../trip-planner-mode-switch/containers/base/base.component';

@Component({
  selector: 'tamu-gisc-trip-planner-directions',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  imports: [TripPlannerDirectionsActionsComponent, TripPlannerModeSwitchComponent]
})
export class TripPlannerDirectionsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private plannerService = inject(TripPlannerService);
  private analytics = inject(Angulartics2);

  /** Every emission redraws, as the field it replaced did, even one that hands back the same result. */
  public readonly result = signal<TripResult>(undefined, { equal: () => false });

  private _destroy$: Subject<boolean> = new Subject();

  public ngOnInit() {
    // Subscribe to travel mode state in trip planner and fetch trip result for mode.
    this.plannerService.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => this.plannerService.getTripResultForTravelMode()),
      takeUntil(this._destroy$)
    ).subscribe((res) => {
      this.result.set(res);
    });
  }

  public ngOnDestroy() {
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }
}
