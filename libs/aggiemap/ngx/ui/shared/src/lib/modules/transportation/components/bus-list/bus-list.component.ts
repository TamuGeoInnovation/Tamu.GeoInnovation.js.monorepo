import { Component, OnInit, OnDestroy, inject, input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
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

  public readonly selectionAction = input<'route' | 'in-place'>('in-place');

  /**
   * The routes, on every environment since #2789 (the maintainer, 9 November 2026). They were development-only until
   * then (#1229), behind a condition here, because they were read from a service public on the development server
   * only; each environment has read its own Transportation hosted view since #2636. Six routes draw fewer or more stops
   * than they list, on production as on dev (#1174); the smoke suite lists them for each environment.
   */
  public routes: Observable<Group<TSRoute>[]>;

  public responsive: ResponsiveSnapshot;

  public ngOnInit(): void {
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
