import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil, pluck } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService, TripResult, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService, UIDragState } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { offCanvasSlideUpFromTop } from '../../animations/elements';

@Component({
  selector: 'tamu-gisc-trip-planner-top',
  templateUrl: './trip-planner-top.component.html',
  styleUrls: ['./trip-planner-top.component.scss'],
  animations: [offCanvasSlideUpFromTop]
})
export class TripPlannerTopComponent implements OnInit, OnDestroy {
  /**
   * Animation trigger.
   *
   * Determines whether the component will slide up whenever the trip directions are dragged past a certain threshold.
   */
  public hide = false;

  /**
   * Animation trigger override.
   *
   * Determines whether the component will side up regardless of any preset drag thresholds.
   */
  public hideOverride = false;

  private _destroy$: Subject<boolean> = new Subject();

  /**
   * Stores result from trip result subscription.
   *
   * Used to populate dumb input boxes with correct number of stops and their names in UI.
   */
  public stops: Observable<TripPoint[]>;

  public result: TripResult;

  public dragStates: UIDragState[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tripPlanner: TripPlannerService,
    private mapService: EsriMapService,
    private dragService: DragService
  ) {}

  public ngOnInit(): void {
    this.stops = this.tripPlanner.Stops;

    this.tripPlanner.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => this.tripPlanner.getTripResultForTravelMode()),
      takeUntil(this._destroy$)
    ).subscribe((result) => {
      this.result = result;

      // In the event that the route is cleared and the top is hidden, bring it back down.
      if (this.result && this.result.result === undefined) {
        this.hide = false;
        this.hideOverride = false;
      }
    });

    this.dragService.states.pipe(takeUntil(this._destroy$)).subscribe((states) => {
      this.hide = states.some((state) => state.dragPercentage > 25);
      this.hideOverride = this.hide;
    });

    this.mapService.store.pipe(takeUntil(this._destroy$)).subscribe((store) => {
      store.view.on('immediate-click', (event) => {
        if (this.result && this.result.isFulfilled && !this.result.isError) {
          // Set the override value
          this.hideOverride = !this.hideOverride;
          this.hide = this.hideOverride;
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Navigates to the search route which renders the omnisearch component.
   *
   * Passes a route param that is used as the index for the trip stop, giving the onmisearch component
   * context on what trip point it's handling
   *
   * @param {*} index
   */
  public summonOmnisearch(index) {
    this.router.navigate(['../../../search', index], { relativeTo: this.route });
  }

  /**
   * If back action is pressed, return to the base route map route which will de-render the trip planner component.
   */
  public returnBaseRoute() {
    this.tripPlanner.clearAll();
    this.router.navigate(['/']);
  }
}
