import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerRuleMode, TripPlannerService } from '../../../../services/trip-planner.service';

@Component({
  selector: 'tamu-gisc-trip-planner-options-base',
  template: ''
})
export class TripPlannerOptionsBaseComponent implements OnInit {
  /**
   * Data injected by the trip planner parking options component factory.
   */
  public settings?: Observable<TripPlannerRuleMode[]>;

  public travelOptions = this.tripPlanner.TravelOptions;

  public isDev: Observable<boolean>;

  constructor(private anl: Angulartics2, private tripPlanner: TripPlannerService, private devTools: TestingService) {}

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
  }

  /**
   * Invokes the trip planner options service which updates the local store value,
   * as well as updating the service state value.
  
   */
  public setOptionValue<T>(key: string | TripPlannerRuleMode, value: T) {
    /**
     * Creates a flat object with keys derived from the provided string array,
     * and value with the scoped parent function value.
     */
    const createOptionsObject = (e: string[]) => {
      return e.reduce((acc, curr) => {
        acc[curr] = value;
        return acc;
      }, {});
    };

    let opts;

    // If key is an object, then it is a `TripPlannerRuleMode`.
    // Determine if there are any configure effects and update store
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
      action: 'persistent_travel_setting',
      properties: {
        category: 'ui_interaction',
        type: 'set',
        label: {
          date: Date.now(),
          guid: guid(),
          ...opts
        }
      }
    });
  }

  /**
   * Get a key value from the  options service which values are a
   * reflection of the local store.
   */
  public getOptionValue(key: string) {
    return this.travelOptions.pipe(pluck(key));
  }
}
