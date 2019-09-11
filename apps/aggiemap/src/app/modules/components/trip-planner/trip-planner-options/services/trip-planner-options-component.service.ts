import { Injectable } from '@angular/core';

import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';
import { TripPlannerParkingOptionsComponent } from '../components/parking/trip-planner-parking-options.component';
import { TripPlannerBikingOptionsComponent } from '../components/biking/trip-planner-biking-options.component';

@Injectable()
export class TripPlannerOptionsComponentService {
  constructor(private tripPlanner: TripPlannerService) {}

  private _dictionary: { type: string; component: any }[] = [
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
  public getComponent(): any {
    const constraints = this.tripPlanner.getCurrentRule().constraints;

    if (!constraints) {
      return;
    }

    // Find any constraint matches in the travel mode vs. the _dictionary
    const dicionaryObject = this._dictionary.find((obj) => constraints.findIndex((c) => c === obj.type) > -1);

    if (!dicionaryObject) {
      return;
    }

    return dicionaryObject.component;
  }
}
