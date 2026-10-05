import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { groupBy, Group } from '@tamu-gisc/common/utils/collection';

@Component({
    selector: 'tamu-gisc-bus-list',
    templateUrl: './bus-list.component.html',
    styleUrls: ['./bus-list.component.scss'],
    standalone: false
})
export class BusListComponent implements OnInit, OnDestroy {
  @Input()
  public selectionAction: 'route' | 'in-place' = 'in-place';

  public routes: Observable<Group<TSRoute>[]>;

  /**
   * Whether to show the routes at all.
   *
   * `TS/Bus_Routes` is not publicly readable on the production GIS server, so AggieMap reads bus data
   * from the development server. That is fine on dev and wrong on production, where it would leave a
   * live feature depending on a development server: if that server restarts or is taken down, bus
   * routes vanish from the live site with nothing to explain why.
   *
   * Until the service is published, production keeps the notice it was already showing, and this is
   * a no-op for anyone using the site. Remove this and the template's `ngIf` once the service is
   * public - see #1036's sibling discussion and the release notes.
   *
   * The routes pipeline below is cold, so leaving it unsubscribed means production makes no request
   * to the development server at all. Hiding only the markup would not have achieved that.
   */
  public busRoutesAvailable: Observable<boolean>;

  public responsive: ResponsiveSnapshot;

  constructor(
    private busService: BusService,
    private responsiveService: ResponsiveService,
    private testing: TestingService
  ) {}

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
