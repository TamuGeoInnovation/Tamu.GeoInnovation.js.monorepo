import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { TripPlannerService } from '../../../../services/trip-planner/trip-planner.service';

import { SearchEvent } from '../../../search/containers/base/base.component';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPoint } from '../../../../services/trip-planner/core/trip-planner-core';

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.scss']
})
export class TripPlannerComponent {
  public dev = this.testing.get('isTesting');

  /**
   * Planner service observable reference that contains the planner service stops used to create a trip request.
   *
   * @type {Observable < TripPoint[] >}
   * @memberof TripPlannerComponent
   */
  public stops: Observable<TripPoint[]> = this.plannerService.Stops;

  constructor(private plannerService: TripPlannerService, private testing: TestingService) {}

  /**
   * Call the planner service to add a result as a trip point to the service stop store
   *
   * @param {TripPoint} result Search result emitted from search component
   * @memberof TripPlannerComponent
   */
  public setSearchResultAsTripStop(result: TripPoint) {
    this.plannerService.setStops([result]);
  }

  /**
   * Triggered when a search component emits a `dirty` event
   *
   * @memberof TripPlannerComponent
   */
  public eventClearRoute() {
    this.plannerService.clearRoute();
  }

  /**
   * Triggered when a search component emits an 'emtpy' event.
   *
   * @param {SearchEvent} e
   * @memberof TripPlannerComponent
   */
  public eventClearStop(e: SearchEvent) {
    this.plannerService.clearStopAt(e.index);
  }
}
