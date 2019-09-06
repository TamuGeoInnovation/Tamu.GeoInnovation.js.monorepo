import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import * as guid from 'uuid/v4';

import { TripPlannerRuleMode, TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';

@Component({
  selector: 'gisc-trip-planner-options-base',
  template: ''
})
export class TripPlannerOptionsBaseComponent {
  /**
   * Data injected by the trip planner parking options component factory.
   *
   * @type {*}
   * @memberof TripPlannerParkingOptionsComponent
   */
  public settings?: Observable<any>;

  public travelOptions = this.tripPlanner.TravelOptions;

  constructor(private anl: Angulartics2, private tripPlanner: TripPlannerService) {}

  /**
   * Invokes the trip planner options service which updates the local store value,
   * as well as updating the service state value.
   *
   * @param {(string | TripPlannerRuleMode)} key
   * @param {*} value
   * @memberof TripPlannerParkingOptionsBaseComponent
   */
  public setOptionValue(key: string | TripPlannerRuleMode, value: any) {
    /**
     * Creates a flat object with keys derived from the provided string array,
     * and value with the scoped parent function value.
     *
     * @param {string[]} e
     * @returns {*}
     */
    const createOptionsObject = (e: string[]): any => {
      return e.reduce((acc, curr, index) => {
        acc[curr] = value;
        return acc;
      }, {});
    };

    let opts;

    // If key is an object, then it is a `TripPlannerRuleMode`.
    // Determine if there are any configure effects and udpate store
    // with created options object based on effect and value.
    if (key instanceof Object) {
      const effect = key.effect;

      if (!effect || effect.length === 0) {
        throw new Error('No mode effect found.');
      }

      opts = createOptionsObject([effect]);
    } else {
      opts = createOptionsObject([key]);
    }

    this.tripPlanner.updateTravelOptions(opts);

    // Report as interaction to Google Analytics
    this.anl.eventTrack.next({
      action: 'Set Persistent Travel Setting',
      properties: {
        category: 'UI Interaction',
        label: JSON.stringify({
          date: Date.now(),
          guid: guid(),
          ...opts
        })
      }
    });
  }

  /**
   * Get a key value from the  options service which values are a
   * reflection of the local store.
   *
   * @param {*} key
   * @returns {Observable<any>}
   * @memberof TripPlannerParkingOptionsBaseComponent
   */
  public getOptionValue(key): Observable<any> {
    return this.travelOptions.pipe(pluck(key));
  }
}
