import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { TripPlannerService, TripPoint } from '@tamu-gisc/maps/feature/trip-planner';

import { SearchSelection, SearchEvent } from '@tamu-gisc/ui-kits/ngx/search';
import { RouterLink } from '@angular/router';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-trip-planner',
  templateUrl: './sidebar-trip-planner.component.html',
  styleUrls: ['./sidebar-trip-planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class SidebarTripPlannerComponent {
  private plannerService = inject(TripPlannerService);
  private testing = inject(TestingService);

  public dev = this.testing.get('isTesting');

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
