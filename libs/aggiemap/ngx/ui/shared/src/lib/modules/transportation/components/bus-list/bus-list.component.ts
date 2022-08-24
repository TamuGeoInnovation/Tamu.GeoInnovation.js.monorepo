import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';
import { groupBy, Group } from '@tamu-gisc/common/utils/collection';

@Component({
  selector: 'tamu-gisc-bus-list',
  templateUrl: './bus-list.component.html',
  styleUrls: ['./bus-list.component.scss']
})
export class BusListComponent implements OnInit, OnDestroy {
  @Input()
  public selectionAction: 'in-place' | 'navigate' = 'in-place';

  public routes: Observable<Group<TSRoute>[]>;

  public responsive: ResponsiveSnapshot;

  constructor(private busService: BusService, private responsiveService: ResponsiveService) {}

  public ngOnInit(): void {
    const catOrder = ['On Campus', 'Off Campus', 'Game Day'];

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
        return catOrder.map((cat) => {
          return grouped.find((g) => (g.identity as TSRoute).Name === cat);
        });
      })
    );
  }

  public ngOnDestroy(): void {
    // When the user navigates away from the component, any and all bus
    // features drawn on the map.
    this.busService.removeAllFromMap();
  }
}
