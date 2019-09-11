import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { BusService, TSRoute } from '../../../../services/transportation/bus/bus.service';
import { ResponsiveService, ResponsiveSnapshot } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'gisc-bus-list',
  templateUrl: './bus-list.component.html',
  styleUrls: ['./bus-list.component.scss']
})
export class BusListComponent implements OnInit, OnDestroy {
  public routes: Observable<TSRoute[]>;

  public responsive: ResponsiveSnapshot;

  public loaded: boolean;

  constructor(
    private busService: BusService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
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

        return of(sorted);
      }),
      tap(() => {
        setTimeout(() => {
          this.loaded = true;
        }, 0);
      })
    );
  }

  public ngOnDestroy(): void {
    // When the user navigates away from the component, any and all bus
    // features drawn on the map.
    this.busService.removeAllFromMap();
  }

  public backAction(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
