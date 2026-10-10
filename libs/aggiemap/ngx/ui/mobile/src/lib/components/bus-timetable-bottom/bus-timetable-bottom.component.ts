import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, mergeMap, Observable, take, withLatestFrom } from 'rxjs';

import { BusService, TSRoute } from '@tamu-gisc/maps/feature/trip-planner';
import { DragService } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';
import { DragDirective } from '@tamu-gisc/ui-kits/ngx/interactions/draggable';

import { AsyncPipe } from '@angular/common';
import { BusRouteComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

@Component({
  selector: 'tamu-gisc-bus-timetable-bottom',
  templateUrl: './bus-timetable-bottom.component.html',
  styleUrls: ['./bus-timetable-bottom.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DragDirective, BusRouteComponent, AsyncPipe]
})
export class BusTimetableBottomComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ds = inject(DragService);
  private readonly bs = inject(BusService);

  public identifier: string;

  public selectedRoute: Observable<string>;

  public busRoute: Observable<TSRoute>;

  public ngOnInit(): void {
    this.identifier = this.ds.register(this);

    this.selectedRoute = this.route.params.pipe(
      map((params) => {
        return params.route;
      })
    );

    this.busRoute = this.bs.getRoutes().pipe(
      mergeMap((routes) => routes),
      withLatestFrom(this.selectedRoute),
      filter(([route, selectedRoute]) => route.ShortName === selectedRoute),
      map(([result]) => {
        return result;
      }),
      take(1)
    );
  }

  public ngOnDestroy(): void {
    this.ds.unregister(this.identifier);
  }

  public routeReturn() {
    this.router.navigate(['map/m/bus']);
  }
}
