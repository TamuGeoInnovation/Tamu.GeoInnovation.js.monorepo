import { Injectable } from '@angular/core';

import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { TripPlannerParkingOptionsComponent } from '../components/parking/trip-planner-parking-options.component';
import { TripPlannerBikingOptionsComponent } from '../components/biking/trip-planner-biking-options.component';
import { TripPlannerOptionsBaseComponent } from '../components/base/base.component';

@Injectable()
export class TripPlannerOptionsComponentService {
  constructor(private tripPlanner: TripPlannerService) {}

  private _dictionary = [
    { type: 'parking_pass', component: TripPlannerParkingOptionsComponent },
    { type: 'bike_share', component: TripPlannerBikingOptionsComponent }
  ];

  /**
   * Checks the current travel mode constraints from trip planner service and if any match the internal
   * dictionary, the reference popup component is returned.
   *
   * @returns {*}
   * @memberof TripPlannerOptionsService
   */
  public getComponent() {
    const constraints = this.tripPlanner.getCurrentRule().constraints;

    if (!constraints) {
      return;
    }

    // Find any constraint matches in the travel mode vs. the _dictionary
    const dictionaryObject = this._dictionary.find((obj) => constraints.findIndex((c) => c === obj.type) > -1);

    if (!dictionaryObject) {
      return;
    }

    return dictionaryObject.component;
  }
}
