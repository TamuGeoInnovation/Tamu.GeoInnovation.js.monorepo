import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { SearchEvent } from '../../../search/containers/base/base.component';
import { SearchSelection } from '@tamu-gisc/search';

import esri = __esri;

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.scss']
})
export class TripPlannerComponent {
  public dev = this.testing.get('isTesting');

  /**
   * Planner service observable reference that contains the planner service stops used to create a trip request.
   */
  public stops: Observable<TripPoint[]> = this.plannerService.Stops;

  constructor(private plannerService: TripPlannerService, private testing: TestingService) {}

  /**
   * Call the planner service to add a result as a trip point to the service stop store
   */
  public setSearchResultAsTripStop(result: SearchSelection<esri.Graphic>) {
    const tPoint = TripPoint.from(result).normalize();

    this.plannerService.setStops([tPoint]);
  }

  /**
   * Triggered when a search component emits a `dirty` event
   */
  public eventClearRoute() {
    this.plannerService.clearRoute();
  }

  /**
   * Triggered when a search component emits an 'empty' event.
   */
  public eventClearStop(e: SearchEvent) {
    this.plannerService.clearStopAt(e.index);
  }
}
