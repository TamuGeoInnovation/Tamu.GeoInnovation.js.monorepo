import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import {
  TripPlannerConnectionsSelectComponent,
  TripPlannerDirectionsComponent,
  TripPlannerModePickerComponent
} from '@tamu-gisc/maps/feature/trip-planner/components';

import { SearchSelection, SearchEvent, SearchComponent } from '@tamu-gisc/ui-kits/ngx/search';
import { AsyncPipe } from '@angular/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-trip-planner',
  templateUrl: './sidebar-trip-planner.component.html',
  styleUrls: ['./sidebar-trip-planner.component.scss'],
  imports: [
    AsyncPipe,
    SearchComponent,
    TripPlannerConnectionsSelectComponent,
    TripPlannerModePickerComponent,
    TripPlannerDirectionsComponent
  ]
})
export class SidebarTripPlannerComponent {
  private plannerService = inject(TripPlannerService);

  /** Whether development-only features are on, which is where the network picker is offered (#2804). */
  public dev = inject(TestingService).get('isTesting');

  /**
   * Planner service observable reference that contains the planner service stops used to create a trip request.
   */
  public stops: Observable<TripPoint[]> = this.plannerService.Stops;

  /**
   * Call the planner service to add a result as a trip point to the service stop store
   */
  public setSearchResultAsTripStop(result: SearchSelection<esri.Graphic>) {
    const tPoint = TripPoint.from(result);

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
