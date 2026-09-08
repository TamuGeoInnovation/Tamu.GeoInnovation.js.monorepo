import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';

/**
 * Route detail shown when a route is expanded in the side panel.
 *
 * The ArcGIS Bus Routes source has no schedule/timetable data, so this renders the route's ordered
 * stop list plus a link out to Transportation Services for live times. (Component name kept as
 * `bus-timetable` to avoid rippling the module + mobile usages.)
 */
@Component({
  selector: 'tamu-gisc-bus-timetable',
  templateUrl: './bus-timetable.component.html',
  styleUrls: ['./bus-timetable.component.scss']
})
export class BusTimetableComponent implements OnInit {
  @Input()
  public route: TSRoute;

  /**
   * Ordered list of stop names for the route.
   */
  public stops: Observable<string[]>;

  /**
   * True once the stop list has been received (drives the loading spinner).
   */
  public loaded: boolean;

  /**
   * External Transportation Services schedule page (the ArcGIS source has no timetable data).
   */
  public readonly scheduleUrl = 'https://transport.tamu.edu/busroutes/?utm_source=aggiemap';

  constructor(private busService: BusService) {}

  public ngOnInit() {
    this.stops = this.busService.getRouteStops(this.route.ShortName).pipe(
      tap(() => {
        this.loaded = true;
      })
    );
  }
}
