import { Component, OnInit, OnDestroy, inject, input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { groupBy, Group } from '@tamu-gisc/common/utils/collection';
import { BusRouteComponent } from '../bus-route/bus-route.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-bus-list',
  templateUrl: './bus-list.component.html',
  styleUrls: ['./bus-list.component.scss'],
  imports: [BusRouteComponent, AsyncPipe]
})
export class BusListComponent implements OnInit, OnDestroy {
  private busService = inject(BusService);
  private responsiveService = inject(ResponsiveService);
  private testing = inject(TestingService);

  public readonly selectionAction = input<'route' | 'in-place'>('in-place');

  public routes: Observable<Group<TSRoute>[]>;

  /**
   * Whether to show the routes at all.
   *
   * Bus routes are development-only (#1229). They were read from `TS/Bus_Routes`, which was public on
   * the development server only, so production could not have them without depending on that server.
   * Each environment now reads its own Transportation hosted view, public on both (#2636), so that
   * reason is gone; whether bus routes go to production is the maintainer's decision, and until it is
   * made production keeps the notice it was already showing. Remove this and the template's condition
   * when they do.
   *
   * The routes pipeline below is cold, so leaving it unsubscribed means production makes no request
   * for bus data at all. Hiding only the markup would not have achieved that.
   */
  public busRoutesAvailable: Observable<boolean>;

  public responsive: ResponsiveSnapshot;

  public ngOnInit(): void {
    this.busRoutesAvailable = this.testing.get('isTesting');

    // The ArcGIS Bus Routes source groups routes by `Campus` (On/Off) only; the legacy "Game Day"
    // group no longer exists.
    const catOrder = ['On Campus', 'Off Campus'];

    this.responsive = this.responsiveService.snapshot;

    this.routes = this.busService.getRoutes().pipe(
      switchMap((routes) => {
        const sorted = routes.sort((r1, r2) => {
          const i1 = parseInt(r1.ShortName, 10);
          if (isNaN(i1)) {
            // Value has a non-number character in it (e.g. 'N')
            return -1000;
          }
          const i2 = parseInt(r2.ShortName, 10);
          if (isNaN(i2)) {
            // see above
            return 1000;
          }
          return i1 - i2;
        });

        const grouped = groupBy(sorted, 'Group.Name', 'Group');

        return of(grouped);
      }),
      map((grouped) => {
        return catOrder
          .map((cat) => {
            return grouped.find((g) => (g.identity as TSRoute).Name === cat);
          })
          .filter((group): group is Group<TSRoute> => group !== undefined);
      })
    );
  }

  public ngOnDestroy(): void {
    // When the user navigates away from the component, any and all bus
    // features drawn on the map.
    this.busService.removeAllFromMap();
  }
}
