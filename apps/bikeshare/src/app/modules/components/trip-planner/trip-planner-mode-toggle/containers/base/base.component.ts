import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, from, of, iif, Subject } from 'rxjs';
import { switchMap, filter, withLatestFrom, map, mergeMap, pluck, takeUntil, shareReplay } from 'rxjs/operators';

import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { TripResult } from '../../../../../services/trip-planner/core/trip-planner-core';

@Component({
  selector: 'gisc-trip-planner-mode-toggle',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripPlannerModeToggleComponent implements OnInit, OnDestroy {
  /**
   * Given each travel type (Walking) can have more than one travel modes (1 & 2),
   * this list represents all the possible travel modes this single toggle will represent.
   *
   * This allows setting view active state for the toggle.
   *
   * **Defaults to an empty array if none provided.**
   *
   * @type {number[]}
   * @memberof TripPlannerModeToggleComponent
   */
  @Input()
  public activeModes: number[] = [];

  /**
   * Material Icon name.
   *
   * Possible list of icons found @ https://material.io/tools/icons/?style=baseline
   *
   * @type {string}
   * @memberof TripPlannerModeToggleComponent
   */
  @Input()
  public iconName: string;

  /**
   * Simple travel type name such as:
   *
   *  - Driving
   *  - Walking
   *  - Biking
   *
   * This name must match one of the TripPlanner service rules.
   *
   * @type {string}
   * @memberof TripPlannerModeToggleComponent
   */
  @Input()
  public name: string;

  /**
   * Short text description of the mode. Used for alt and aria label text.
   *
   * @type {string}
   * @memberof TripPlannerModeToggleComponent
   */
  @Input()
  public label: string;

  /**
   * Single trip result for the specified travel mode derived from trip planner results collection.
   *
   * Used to display view ETA, errors, unavailability, etc.
   *
   * @type {Observable<TripResult>}
   * @memberof TripPlannerModeToggleComponent
   */
  public status: Observable<TripResult>;

  /**
   * Active state determined by the current mode and the service travel mode.
   *
   * @type {Observable<boolean>}
   * @memberof TripPlannerModeToggleComponent
   */
  public active: Observable<boolean>;

  public meta_status: Observable<{ allPristine: boolean; toggleHasResult: boolean; isModeRestricted: boolean }>;

  /**
   * Numeric representation for the toggle travel mode.
   *
   * Mode is calculated every time a trip is requested. Based on possible `activeModes`, TripPlanner rules, and active
   * modifiers, the appropriate toggle travelMode is determined.
   *
   * Correctly determining the travel mode for the toggle is critical because it displays at-a-glance result info
   * such as status, eta, and progress.
   *
   * @type {Observable<number>}
   * @memberof TripPlannerModeToggleComponent
   */
  public travelMode: number;

  private $destroy: Subject<boolean> = new Subject();

  constructor(private tripPlanner: TripPlannerService) {}

  public ngOnInit() {
    // One every trip planner result change, calculate the current travel mode.
    this.tripPlanner.TravelOptions.pipe(
      pluck('travel_mode'),
      switchMap(() => {
        const thisToggleMode = this.tripPlanner.calculateTravelMode(this.activeModes);

        return of(thisToggleMode);
      }),
      takeUntil(this.$destroy)
    ).subscribe((mode) => {
      this.travelMode = mode;
    });

    //
    // Get the latest trip result for the toggle travel mode
    //
    this.status = this.tripPlanner.Result.pipe(
      mergeMap((results) => {
        // Convert the results array into a stream.
        return from(
          // Perform a test to determine which observable will be emitted.
          iif(
            // Check to see if the service trip results contain a trip result for the service travel mode.
            () => {
              const index =
                results.findIndex((r) => {
                  return !r.params || parseInt(r.params.travelMode, 10) === this.travelMode;
                }) > -1;

              return index;
            },
            // If it does, return the trip result a pristine collection.
            from(results),
            // If it does not, return a placehodler trip result followed by the rest of the trip results.
            //
            // The placeholder trip result MUST be first as subsequent source emissions may contain
            // the trip result of interest as requests are resolved.
            from([new TripResult({}), ...results])
          )
        );
      }),
      withLatestFrom(of(this.travelMode), (result, mode) => {
        // Return the current mapped trip result along with the latest trip planner travel mode.
        return { result, mode };
      }),
      filter((latest) => {
        // If latest result params property is `undefined`, it means trip result is a default state
        // which can occur when the trip is reset. If that is the case, return truthy.
        //
        // If the latest result has params travel mode, compare it to the toggle travel mode. If they match,
        // resolve truthy for the trip result.
        return !latest.result.params || parseInt(latest.result.params.travelMode, 10) === this.travelMode;
      }),
      map((latest) => {
        // Return only the trip result.
        return latest.result;
      })
    );

    //
    // Map the service travel mode to a boolean if the `activeModes` collection contains the service travel mode.
    //
    // If true, the current travel mode toggle is active and vice versa.
    //
    this.active = this.tripPlanner.TravelOptions.pipe(
      pluck('travel_mode'),
      map((val: number) => {
        return this.activeModes.includes(val);
      })
    );

    this.meta_status = this.tripPlanner.Result.pipe(
      map((results) => {
        const def = { allPristine: true, toggleHasResult: false, isModeRestricted: false };

        // Perofrm all tests in a reducing function to reduce the number of iterative calculations.
        const meta =
          results.reduce((acc, curr, index) => {
            const newAccumulated = { ...acc };

            if (curr.isError || curr.isFulfilled || curr.isProcessing) {
              // Result item is pristine.
              newAccumulated.allPristine = false;
            }

            if (curr.params && curr.params.travelMode && this.activeModes.includes(parseInt(curr.params.travelMode, 10))) {
              // Current result has params, travel mode, and travel mode is in the toggle modes array.
              newAccumulated.toggleHasResult = true;
            }

            if (newAccumulated.toggleHasResult === false) {
              const qualifying = this.tripPlanner.getQualifyingTravelModes(true);
              const toggleModesInQualifying = qualifying.some((m) => {
                return this.activeModes.includes(m);
              });

              if (!toggleModesInQualifying) {
                newAccumulated.isModeRestricted = true;
              }
            }

            return newAccumulated;
          }, def) || def;

        return meta;
      }),
      shareReplay(1)
    );
  }

  public ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.complete();
  }

  /**
   * Calculate the travel mode from string reference and update call the trip planner service to update it.
   *
   * @memberof TripPlannerModeToggleComponent
   */
  public setTravelMode = (modeName: string) => {
    this.tripPlanner.calculateTravelMode(this.activeModes.map((mode) => mode), true);
  };
}
