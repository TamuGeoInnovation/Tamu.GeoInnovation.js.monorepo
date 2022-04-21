import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fromEventPattern, Observable, pipe, Subject } from 'rxjs';
import { switchMap, takeUntil, pluck, map } from 'rxjs/operators';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { TripPlannerService, TripResult, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService, UIDragState } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { offCanvasSlideUpFromTop } from '../../animations/elements';

import esri = __esri;

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

  // TODO: There are a lot of internal subscriptions in here. Make more reactive.
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

    // Slides component in/out of view if there is a trip drawn on the map.
    // This allows the user to maximize the amount of map real estate on their screen
    this.mapService.store
      .pipe(
        map((instances) => {
          return instances.view;
        }),
        this.$immediateClickHandler(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        if (this.result && this.result.isFulfilled && !this.result.isError) {
          // Set the override value
          this.hideOverride = !this.hideOverride;
          this.hide = this.hideOverride;
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(undefined);
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

  private $immediateClickHandler() {
    return pipe(
      switchMap((view: MapServiceInstance['view']) => {
        let handle: esri.Handle;

        const addHandler = (handler) => {
          handle = view.on('immediate-click', handler);
        };

        const removeHandler = () => {
          handle.remove();
        };

        return fromEventPattern<esri.ViewImmediateClickEvent>(addHandler, removeHandler);
      })
    );
  }
}
